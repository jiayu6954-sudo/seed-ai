/**
 * I012: Semantic Memory Retrieval
 *
 * 替代原有的"全量注入"策略（formatMemoryForPrompt 把所有记忆塞入 system prompt）。
 *
 * 新策略：
 *   1. 用当前用户消息生成 query embedding
 *   2. 在向量库中检索最相关的 Top-K 记忆片段
 *   3. 只注入相关片段，context 大小恒定（不随历史会话增长）
 *
 * 与 I013 双脑架构的协作：
 *   - 若 Ollama 可用：用本地 embedding 模型向量化（零成本）
 *   - 若不可用：TF-IDF 降级（纯算法，完全离线）
 *   - 提取逻辑：本地模型可替代 Haiku 完成记忆摘要提取（I013）
 */

import path from "node:path";
import crypto from "node:crypto";
import type { LongTermMemory } from "./long-term.js";
import { loadLongTermMemory } from "./long-term.js";
import { VectorStore, type MemoryLayer } from "./vector-store.js";
import { createEmbeddingProvider, type EmbeddingProvider } from "./embeddings.js";
import { logger } from "../utils/logger.js";

// ── Config ────────────────────────────────────────────────────────────────────

export interface SemanticRetrievalConfig {
  /** Max memory chunks to inject into system prompt */
  topK: number;
  /** Minimum cosine similarity threshold */
  threshold: number;
  /** Ollama embedding model (default: nomic-embed-text) */
  embeddingModel: string;
  /** Whether to re-index memory on every session (vs only when memory changes) */
  reindexOnChange: boolean;
}

export const DEFAULT_SEMANTIC_CONFIG: SemanticRetrievalConfig = {
  topK: 8,
  threshold: 0.25,
  embeddingModel: "nomic-embed-text",
  reindexOnChange: true,
};

// ── SemanticMemoryRetriever ───────────────────────────────────────────────────

export class SemanticMemoryRetriever {
  private store: VectorStore;
  private embedder: EmbeddingProvider | null = null;
  private initialized = false;

  constructor(private config: SemanticRetrievalConfig = DEFAULT_SEMANTIC_CONFIG) {
    this.store = new VectorStore();
  }

  /**
   * Initialise: load vector store + create embedding provider.
   * Called once per session.
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    await this.store.load();
    this.embedder = await createEmbeddingProvider(this.config.embeddingModel);
    this.initialized = true;
    logger.debug("semantic_retrieval.init", {
      mode: this.embedder.mode,
      storeStats: this.store.stats(),
    });
  }

  /**
   * Index a project's memory layers into the vector store.
   * Should be called after memory is loaded/updated.
   *
   * Only re-indexes layers that have changed (content hash comparison).
   */
  async indexProjectMemory(projectPath: string, memory: LongTermMemory): Promise<void> {
    await this.ensureInit();
    const projectId = projectFingerprint(projectPath);

    const layers: Array<{ layer: MemoryLayer; text: string }> = [
      { layer: "user", text: memory.user },
      { layer: "context", text: memory.projectContext },
      { layer: "decisions", text: memory.projectDecisions },
      { layer: "learnings", text: memory.projectLearnings },
    ];

    let indexed = 0;
    for (const { layer, text } of layers) {
      if (!text.trim()) continue;
      await this.store.upsertMemoryLayer(projectId, layer, text, this.embedder!);
      indexed++;
    }

    if (indexed > 0) {
      await this.store.save();
    }
    logger.debug("semantic_retrieval.indexed", { projectId, layers: indexed });
  }

  /**
   * Main retrieval function.
   * Given the current user message, returns the most relevant memory chunks
   * formatted as a system prompt section.
   */
  async retrieveRelevant(
    projectPath: string,
    userMessage: string,
  ): Promise<string | null> {
    await this.ensureInit();
    const projectId = projectFingerprint(projectPath);

    // Embed the query
    let queryVector;
    try {
      queryVector = await this.embedder!.embed(userMessage);
    } catch (err) {
      logger.warn("semantic_retrieval.embed_failed", err);
      return null;
    }

    // Search
    const results = this.store.search(
      queryVector,
      projectId,
      this.config.topK,
      this.config.threshold,
    );

    if (results.length === 0) return null;

    // Format results grouped by layer
    const byLayer = new Map<MemoryLayer, string[]>();
    for (const { chunk } of results) {
      const existing = byLayer.get(chunk.layer) ?? [];
      existing.push(chunk.text);
      byLayer.set(chunk.layer, existing);
    }

    const sections: string[] = [];
    const layerLabels: Record<MemoryLayer, string> = {
      user: "About this user",
      context: "Project overview",
      decisions: "Key technical decisions",
      learnings: "What we've learned",
    };

    for (const [layer, texts] of byLayer) {
      sections.push(`### ${layerLabels[layer]}\n${texts.join("\n")}`);
    }

    const projectName = path.basename(projectPath);
    const modeNote = this.embedder!.mode === "tfidf"
      ? " (keyword-based fallback)"
      : ` (${results.length} relevant chunks, semantic search)`;

    return `## Relevant memory — ${projectName}${modeNote}\n\n${sections.join("\n\n")}`;
  }

  /** Stats for /memory slash command */
  getStats(): { total: number; byLayer: Record<string, number>; projects: number; mode: string } {
    return {
      ...this.store.stats(),
      mode: this.embedder?.mode ?? "not initialized",
    };
  }

  private async ensureInit(): Promise<void> {
    if (!this.initialized) await this.init();
  }
}

// ── Singleton for session reuse ───────────────────────────────────────────────

let _retriever: SemanticMemoryRetriever | null = null;

export function getSemanticRetriever(
  config?: Partial<SemanticRetrievalConfig>
): SemanticMemoryRetriever {
  if (!_retriever) {
    _retriever = new SemanticMemoryRetriever({ ...DEFAULT_SEMANTIC_CONFIG, ...config });
  }
  return _retriever;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function projectFingerprint(projectPath: string): string {
  const normalized = path.resolve(projectPath).toLowerCase();
  return crypto.createHash("sha1").update(normalized).digest("hex").slice(0, 12);
}

// ── Enhanced system prompt builder ───────────────────────────────────────────

/**
 * Drop-in replacement for `formatMemoryForPrompt` + `loadLongTermMemory`.
 *
 * If semantic retrieval is configured and a userMessage is provided:
 *   → returns semantically relevant chunks only
 * Otherwise:
 *   → falls back to original full-memory injection
 */
export async function buildMemorySection(
  projectPath: string,
  userMessage: string,
  config?: Partial<SemanticRetrievalConfig>,
): Promise<string | null> {
  try {
    const retriever = getSemanticRetriever(config);
    await retriever.init();

    // Load and index current memory (re-index only on change)
    const memory = await loadLongTermMemory(projectPath);
    const hasAny = memory.user || memory.projectContext || memory.projectDecisions || memory.projectLearnings;
    if (!hasAny) return null;

    await retriever.indexProjectMemory(projectPath, memory);

    // Retrieve relevant chunks for this specific query
    return await retriever.retrieveRelevant(projectPath, userMessage);
  } catch (err) {
    logger.warn("semantic_retrieval.build_section_failed", err);
    // Fall back to nothing on error — non-fatal
    return null;
  }
}
