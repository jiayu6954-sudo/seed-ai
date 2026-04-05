import Anthropic from "@anthropic-ai/sdk";
import type { ConversationMessage } from "../types/agent.js";
import type { DevAISettings } from "../types/config.js";
import { logger } from "../utils/logger.js";

const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  "claude-sonnet-4-6": 200_000,
  "claude-opus-4-6": 200_000,
  "claude-haiku-4-5-20251001": 200_000,
  "claude-opus-4-5": 200_000,
  "claude-sonnet-4-5": 200_000,
};

// Innovation 3: use cheapest model for summarization
const SUMMARY_MODEL = "claude-haiku-4-5-20251001";
const SUMMARY_MAX_TOKENS = 600;

export class ContextManager {
  private messages: ConversationMessage[] = [];
  private lastInputTokens = 0;
  // Accumulated summaries from previous compressions
  private summaryHistory: string[] = [];

  constructor(
    private settings: DevAISettings,
    private model: string
  ) {}

  append(message: ConversationMessage): void {
    this.messages.push(message);
    if (this.messages.length > this.settings.context.maxHistoryMessages) {
      this.messages = this.messages.slice(
        this.messages.length - this.settings.context.maxHistoryMessages
      );
    }
  }

  getHistory(): ConversationMessage[] {
    return [...this.messages];
  }

  /** Returns accumulated summaries to inject into system prompt */
  getSummaryContext(): string | null {
    if (this.summaryHistory.length === 0) return null;
    return `## 早期对话摘要（已压缩）\n\n${this.summaryHistory.join("\n\n---\n\n")}`;
  }

  updateTokenCount(usage: Anthropic.Usage): void {
    this.lastInputTokens =
      (usage.input_tokens ?? 0) +
      ((usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0);
  }

  shouldCompact(): boolean {
    const contextWindow = MODEL_CONTEXT_WINDOWS[this.model] ?? 200_000;
    const usageRatio = this.lastInputTokens / contextWindow;
    const threshold = this.settings.context.compactionThreshold / 100;
    return usageRatio > threshold;
  }

  /**
   * Innovation 3: LLM-powered Smart Context Compression
   *
   * 与 Claude Code 的简单截断不同，这里：
   * 1. 用 Haiku（最便宜的模型）对被删除的消息生成语义摘要
   * 2. 将摘要保存到 summaryHistory，注入回系统提示
   * 3. 这样即使旧消息被删除，模型仍然知道"之前发生了什么"
   *
   * 成本：每次压缩约 $0.0002（haiku 非常便宜）
   * 收益：防止模型因遗忘早期上下文而重复工作或犯错
   */
  async compactWithSummary(apiKey: string): Promise<void> {
    if (this.messages.length <= 4) return;

    const keepCount = Math.max(4, Math.floor(this.settings.context.maxHistoryMessages / 2));
    const toSummarize = this.messages.slice(0, this.messages.length - keepCount);

    if (toSummarize.length === 0) return;

    logger.info("context.compact.start", {
      total: this.messages.length,
      toSummarize: toSummarize.length,
      keepCount,
    });

    // Generate summary using cheapest model
    let summary = "";
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: SUMMARY_MODEL,
        max_tokens: SUMMARY_MAX_TOKENS,
        system:
          "你是一个对话摘要助手。你的任务是从AI编程助手的对话历史中提取关键信息。" +
          "输出简洁的中文摘要，包含：已完成的操作、发现的问题、重要决策、当前状态。" +
          "不超过400字。",
        messages: [
          ...toSummarize,
          {
            role: "user",
            content:
              "请总结以上对话中的关键内容，以便在后续对话中参考。重点：做了什么、发现了什么、当前状态。",
          },
        ],
      });

      if (response.content[0]?.type === "text") {
        summary = response.content[0].text;
        this.summaryHistory.push(summary);
        logger.info("context.compact.summary_generated", { length: summary.length });
      }
    } catch (err) {
      // 摘要失败不影响主流程，降级为无摘要的简单截断
      logger.warn("context.compact.summary_failed", err);
      summary = `[摘要生成失败：${toSummarize.length} 条早期消息已删除]`;
      this.summaryHistory.push(summary);
    }

    // Keep only the recent messages
    this.messages = this.messages.slice(this.messages.length - keepCount);
    logger.info("context.compact.done", { remaining: this.messages.length });
  }

  /**
   * Fallback: simple compaction without LLM summary
   * Used when no API key available or in tests
   */
  compact(): void {
    if (this.messages.length <= 2) return;
    const keepCount = Math.max(2, Math.floor(this.settings.context.maxHistoryMessages / 2));
    const dropped = this.messages.length - keepCount;
    if (dropped <= 0) return;

    logger.info("context.compact.simple", { dropped, keepCount });
    const placeholder: ConversationMessage = {
      role: "user",
      content: `[系统：${dropped} 条早期消息已压缩以控制token用量。对话从最近 ${keepCount} 条继续。]`,
    };
    this.messages = [placeholder, ...this.messages.slice(dropped)];
  }

  clear(): void {
    this.messages = [];
    this.lastInputTokens = 0;
    this.summaryHistory = [];
  }

  get messageCount(): number {
    return this.messages.length;
  }

  get estimatedTokens(): number {
    return this.lastInputTokens;
  }
}
