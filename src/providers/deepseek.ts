/**
 * DeepSeek provider — uses DeepSeek's OpenAI-compatible REST API via native fetch.
 * No openai npm package needed.
 *
 * API docs: https://platform.deepseek.com/api-docs/
 * Base URL:  https://api.deepseek.com/v1
 * Models:    deepseek-chat (DeepSeek-V3), deepseek-reasoner (DeepSeek-R1)
 */
import type { AIProvider, StreamParams, ProviderStreamHandle, NormalizedMessage, NormalizedDelta, NormalizedBlock } from "./interface.js";
import type { ConversationMessage } from "../types/agent.js";
import type { ToolDefinition } from "../types/tools.js";
import { logger } from "../utils/logger.js";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

// ── OpenAI-compatible wire types (minimal) ───────────────────────────────────

interface OAIToolFunction {
  name: string;
  arguments: string;
}

interface OAIToolCall {
  id: string;
  type: "function";
  function: OAIToolFunction;
}

interface OAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: OAIToolCall[];
  tool_call_id?: string;
}

interface OAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
}

interface OAIChunkDelta {
  content?: string;
  reasoning_content?: string;
  tool_calls?: Array<{
    index: number;
    id?: string;
    function?: { name?: string; arguments?: string };
  }>;
}

interface OAIChunk {
  choices: Array<{
    delta: OAIChunkDelta;
    finish_reason: string | null;
  }>;
  usage?: OAIUsage;
}

// ── Conversion helpers ────────────────────────────────────────────────────────

/** Convert our ToolDefinition (Anthropic format) → OpenAI function tool */
function toOAITool(def: ToolDefinition): object {
  return {
    type: "function",
    function: {
      name: def.name,
      description: def.description,
      parameters: def.input_schema,
    },
  };
}

/**
 * Convert Anthropic-format conversation history → OpenAI messages.
 * systemPrompt goes as the first system message.
 */
function toOAIMessages(
  systemPrompt: string,
  messages: ConversationMessage[]
): OAIMessage[] {
  const result: OAIMessage[] = [{ role: "system", content: systemPrompt }];

  for (const msg of messages) {
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        result.push({ role: "user", content: msg.content });
        continue;
      }

      // Array content: may contain tool_result blocks
      const toolResults: OAIMessage[] = [];
      const textParts: string[] = [];

      for (const block of msg.content) {
        if (block.type === "tool_result") {
          const rawContent = block.content;
          const text =
            typeof rawContent === "string"
              ? rawContent
              : Array.isArray(rawContent)
              ? rawContent.map((c) => (c.type === "text" ? c.text : "")).join("")
              : "";
          toolResults.push({
            role: "tool",
            tool_call_id: block.tool_use_id,
            content: text,
          });
        } else if (block.type === "text") {
          textParts.push(block.text);
        }
      }

      // Tool results come before user text (OpenAI convention)
      result.push(...toolResults);
      if (textParts.length > 0) {
        result.push({ role: "user", content: textParts.join("\n") });
      }
    } else if (msg.role === "assistant") {
      if (typeof msg.content === "string") {
        result.push({ role: "assistant", content: msg.content });
        continue;
      }

      const textBlocks = msg.content.filter((b) => b.type === "text");
      const toolUseBlocks = msg.content.filter((b) => b.type === "tool_use");

      if (toolUseBlocks.length > 0) {
        result.push({
          role: "assistant",
          content: textBlocks.length > 0 ? textBlocks.map((b) => (b.type === "text" ? b.text : "")).join("") : null,
          tool_calls: toolUseBlocks
            .filter((b) => b.type === "tool_use")
            .map((b) => {
              const tb = b as Extract<typeof b, { type: "tool_use" }>;
              return {
                id: tb.id,
                type: "function" as const,
                function: {
                  name: tb.name,
                  arguments: JSON.stringify(tb.input),
                },
              };
            }),
        });
      } else {
        const text = textBlocks.map((b) => (b.type === "text" ? b.text : "")).join("");
        result.push({ role: "assistant", content: text });
      }
    }
  }

  return result;
}

// ── SSE parser ────────────────────────────────────────────────────────────────

async function* parseSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<OAIChunk> {
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as OAIChunk;
        } catch {
          // Malformed chunk, skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── DeepSeek provider ─────────────────────────────────────────────────────────

export class DeepSeekProvider implements AIProvider {
  readonly providerName = "deepseek" as const;

  constructor(private apiKey: string) {}

  stream(params: StreamParams): ProviderStreamHandle {
    return new DeepSeekStreamHandle(this.apiKey, params);
  }
}

class DeepSeekStreamHandle implements ProviderStreamHandle {
  // Accumulated during streaming
  private accText = "";
  private accThinking = "";
  private toolCallAccumulator: Map<
    number,
    { id: string; name: string; arguments: string }
  > = new Map();
  private finishReason: string | null = null;
  private finalUsage: OAIUsage | null = null;
  private streamConsumed = false;
  private streamPromise: Promise<void> | null = null;
  private deltaQueue: NormalizedDelta[] = [];
  private deltaResolvers: Array<() => void> = [];

  constructor(private apiKey: string, private params: StreamParams) {}

  async *deltas(): AsyncIterable<NormalizedDelta> {
    await this.ensureStream();
    // Yield accumulated + future deltas
    let index = 0;
    while (true) {
      if (index < this.deltaQueue.length) {
        yield this.deltaQueue[index]!;
        index++;
      } else if (this.streamConsumed) {
        break;
      } else {
        // Wait for next delta
        await new Promise<void>((resolve) => {
          this.deltaResolvers.push(resolve);
        });
      }
    }
  }

  private pushDelta(delta: NormalizedDelta): void {
    this.deltaQueue.push(delta);
    const resolver = this.deltaResolvers.shift();
    if (resolver) resolver();
  }

  private async ensureStream(): Promise<void> {
    if (this.streamPromise) return this.streamPromise;
    this.streamPromise = this.runStream();
    return this.streamPromise;
  }

  private async runStream(): Promise<void> {
    const body = {
      model: this.params.model,
      max_tokens: this.params.maxTokens,
      stream: true,
      messages: toOAIMessages(this.params.systemPrompt, this.params.messages),
      tools:
        this.params.tools.length > 0
          ? this.params.tools.map(toOAITool)
          : undefined,
      tool_choice: this.params.tools.length > 0 ? "auto" : undefined,
    };

    logger.debug("deepseek.stream.start", { model: this.params.model });

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: this.params.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`DeepSeek API ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error("DeepSeek response has no body");
    }

    const reader = response.body.getReader();

    try {
      for await (const chunk of parseSSE(reader, this.params.signal)) {
        const choice = chunk.choices[0];
        if (!choice) continue;

        const delta = choice.delta;

        // Text content
        if (delta.content) {
          this.accText += delta.content;
          this.pushDelta({ type: "text", text: delta.content });
        }

        // Reasoning / thinking content (deepseek-reasoner)
        if (delta.reasoning_content) {
          this.accThinking += delta.reasoning_content;
          this.pushDelta({ type: "thinking", text: delta.reasoning_content });
        }

        // Tool call accumulation
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = this.toolCallAccumulator.get(tc.index) ?? {
              id: "",
              name: "",
              arguments: "",
            };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name += tc.function.name;
            if (tc.function?.arguments) existing.arguments += tc.function.arguments;
            this.toolCallAccumulator.set(tc.index, existing);
          }
        }

        if (choice.finish_reason) {
          this.finishReason = choice.finish_reason;
        }

        if (chunk.usage) {
          this.finalUsage = chunk.usage;
        }
      }
    } finally {
      this.streamConsumed = true;
      // Unblock any waiting delta consumers
      for (const resolve of this.deltaResolvers) resolve();
      this.deltaResolvers = [];
      logger.debug("deepseek.stream.done", { finishReason: this.finishReason });
    }
  }

  async finalMessage(): Promise<NormalizedMessage> {
    await this.ensureStream();

    const content: NormalizedBlock[] = [];

    if (this.accText) {
      content.push({ type: "text", text: this.accText });
    }

    for (const [, tc] of this.toolCallAccumulator) {
      let input: unknown = {};
      try {
        input = JSON.parse(tc.arguments || "{}");
      } catch {
        input = { raw: tc.arguments };
      }
      content.push({
        type: "tool_use",
        id: tc.id || `call_${Math.random().toString(36).slice(2)}`,
        name: tc.name,
        input,
      });
    }

    // Map OpenAI finish_reason → Anthropic stop_reason convention
    let stopReason: NormalizedMessage["stop_reason"] = "end_turn";
    if (this.finishReason === "tool_calls") {
      stopReason = "tool_use";
    } else if (this.finishReason === "length") {
      stopReason = "max_tokens";
    } else if (this.finishReason === "stop") {
      stopReason = "end_turn";
    }

    return {
      stop_reason: stopReason,
      content,
      usage: {
        input_tokens: this.finalUsage?.prompt_tokens ?? 0,
        output_tokens: this.finalUsage?.completion_tokens ?? 0,
      },
    };
  }
}
