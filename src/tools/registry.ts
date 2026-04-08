import type Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFINITIONS } from "./definitions.js";
import { executeBash } from "./bash.js";
import { executeFileRead } from "./file-read.js";
import { executeFileWrite } from "./file-write.js";
import { executeFileEdit } from "./file-edit.js";
import { executeGlob } from "./glob.js";
import { executeGrep } from "./grep.js";
import { executeWebFetch } from "./web-fetch.js";
import { executeWebSearch, type SearchConfig } from "./web-search.js";
import { ToolCache } from "./cache.js";
import { MCPRegistry } from "../mcp/registry.js";
import { SandboxManager } from "../sandbox/manager.js";
import type {
  ToolDefinition,
  ToolResult,
  ToolExecutionContext,
  BashInput,
  FileReadInput,
  FileWriteInput,
  FileEditInput,
  GlobInput,
  GrepInput,
  WebFetchInput,
  WebSearchInput,
} from "../types/tools.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

// Zod schemas for runtime input validation
const BashSchema = z.object({ command: z.string(), timeout: z.number().optional() });
const FileReadSchema = z.object({ path: z.string(), startLine: z.number().optional(), endLine: z.number().optional() });
const FileWriteSchema = z.object({ path: z.string(), content: z.string() });
const FileEditSchema = z.object({ path: z.string(), oldString: z.string(), newString: z.string() });
const GlobSchema = z.object({ pattern: z.string(), path: z.string().optional() });
const GrepSchema = z.object({ pattern: z.string(), path: z.string().optional(), include: z.string().optional(), flags: z.string().optional() });
const WebFetchSchema = z.object({
  url: z.string(),
  maxBytes: z.number().optional(),
  referer: z.string().optional(),
  headers: z.record(z.string()).optional(),
});
const WebSearchSchema = z.object({
  query: z.string(),
  provider: z.enum(["auto", "tavily", "brave", "serper", "duckduckgo"]).optional(),
  maxResults: z.number().optional(),
});

/** I009-F: Claude Code's DEFAULT_MAX_RESULT_SIZE_CHARS — hard cap per tool result */
const MAX_TOOL_RESULT_CHARS = 50_000;

/** Truncate a tool result to MAX_TOOL_RESULT_CHARS if needed. */
function capToolResult(result: ToolResult): ToolResult {
  if (result.content.length <= MAX_TOOL_RESULT_CHARS) return result;
  return {
    ...result,
    content:
      result.content.slice(0, MAX_TOOL_RESULT_CHARS) +
      `\n[Result truncated at ${MAX_TOOL_RESULT_CHARS.toLocaleString()} chars]`,
    metadata: { ...(result.metadata ?? {}), truncated: true },
  };
}

export interface ExecuteResult extends ToolResult {
  fromCache: boolean;
}

export class ToolRegistry {
  private cwd: string;
  private mcpRegistry: MCPRegistry | null = null;
  private sandbox: SandboxManager | null = null;
  private searchConfig: SearchConfig;
  // Innovation 2: per-session tool result cache
  readonly cache = new ToolCache();

  constructor(cwd: string, mcpRegistry?: MCPRegistry, sandbox?: SandboxManager, searchConfig?: SearchConfig) {
    this.cwd = cwd;
    this.mcpRegistry = mcpRegistry ?? null;
    this.sandbox = sandbox ?? null;
    this.searchConfig = searchConfig ?? {};
  }

  /** Returns tool definitions in provider-neutral format (native + MCP) */
  getDefinitions(): ToolDefinition[] {
    const mcpDefs = this.mcpRegistry?.getToolDefinitions() ?? [];
    return [...TOOL_DEFINITIONS, ...mcpDefs];
  }

  /** @deprecated use getDefinitions() */
  getAnthropicDefinitions(): Anthropic.Tool[] {
    return this.getDefinitions().map((def) => ({
      name: def.name,
      description: def.description,
      input_schema: def.input_schema,
    }));
  }

  async execute(
    toolName: string,
    rawInput: unknown,
    opts: { signal?: AbortSignal } = {}
  ): Promise<ExecuteResult> {
    const ctx: ToolExecutionContext = {
      cwd: this.cwd,
      timeoutMs: 30_000,
      signal: opts.signal,
    };

    logger.debug("tool.execute", { toolName });

    // MCP tools: route directly to MCPRegistry (no cache, no switch)
    if (this.mcpRegistry?.hasTool(toolName)) {
      const result = await this.mcpRegistry.execute(toolName, rawInput as Record<string, unknown>);
      return { ...result, fromCache: false };
    }

    // Innovation 2: check cache BEFORE execution (native tools only)
    const nativeName = toolName as import("../types/tools.js").ToolName;
    const cached = this.cache.get(nativeName, rawInput);
    if (cached) {
      logger.debug("tool.cache_hit", { toolName });
      return { ...cached, fromCache: true };
    }

    // Innovation 2: invalidate cache on writes BEFORE execution
    // (so any file_read that happens after this write gets fresh content)
    this.cache.invalidateForWrite(nativeName, rawInput);

    try {
      let result: ToolResult;

      switch (toolName) {
        case "bash": {
          const input = BashSchema.parse(rawInput) as BashInput;
          if (this.sandbox) {
            // Innovation 5: execute inside Docker container
            // Graceful degradation: if Docker daemon is not running, fall back
            // to native bash rather than failing the entire tool call.
            const dockerAvailable = await this.sandbox.isAvailable();
            if (dockerAvailable) {
              const sr = await this.sandbox.run(input.command, this.cwd, opts.signal);
              const rawOut = sr.all.length > 0 ? sr.all : "(no output)";
              const sandboxTrunc = rawOut.length > 30_000;
              const output = sandboxTrunc ? rawOut.slice(0, 30_000) : rawOut;
              const truncated = sandboxTrunc;
              result = {
                content: [
                  output,
                  truncated ? "\n[Output truncated at 30,000 chars]" : "",
                  sr.timedOut ? `\n[Command timed out after ${input.timeout ?? 30_000}ms]` : "",
                  `\n[Exit code: ${sr.exitCode}]`,
                ].filter(Boolean).join(""),
                isError: sr.exitCode !== 0,
                metadata: { exitCode: sr.exitCode, truncated },
              };
            } else {
              // Docker unavailable — fall back to host bash with a notice
              logger.warn("sandbox.fallback_to_host", { reason: "Docker daemon not running" });
              const native = await executeBash(input, ctx);
              result = {
                ...native,
                content: `[Sandbox unavailable — running on host]\n${native.content}`,
              };
            }
          } else {
            result = await executeBash(input, ctx);
          }
          break;
        }
        case "file_read": {
          const input = FileReadSchema.parse(rawInput) as FileReadInput;
          result = await executeFileRead(input, ctx);
          break;
        }
        case "file_write": {
          const input = FileWriteSchema.parse(rawInput) as FileWriteInput;
          result = await executeFileWrite(input, ctx);
          break;
        }
        case "file_edit": {
          const input = FileEditSchema.parse(rawInput) as FileEditInput;
          result = await executeFileEdit(input, ctx);
          break;
        }
        case "glob": {
          const input = GlobSchema.parse(rawInput) as GlobInput;
          result = await executeGlob(input, ctx);
          break;
        }
        case "grep": {
          const input = GrepSchema.parse(rawInput) as GrepInput;
          result = await executeGrep(input, ctx);
          break;
        }
        case "web_fetch": {
          const input = WebFetchSchema.parse(rawInput) as WebFetchInput;
          result = await executeWebFetch(input, ctx);
          break;
        }
        case "web_search": {
          const input = WebSearchSchema.parse(rawInput) as WebSearchInput;
          result = await executeWebSearch(input, ctx, this.searchConfig);
          break;
        }
        default:
          return { content: `Unknown tool: ${toolName}`, isError: true, fromCache: false };
      }

      // I009-F: cap result size before caching or returning
      result = capToolResult(result);

      // Innovation 2: store result in cache
      this.cache.set(nativeName, rawInput, result);

      return { ...result, fromCache: false };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return {
          content: `Invalid tool input for ${toolName}: ${err.issues.map((i) => i.message).join(", ")}`,
          isError: true,
          fromCache: false,
        };
      }
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`tool.execute.${toolName}`, err);
      return { content: `Tool error: ${msg}`, isError: true, fromCache: false };
    }
  }
}
