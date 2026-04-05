/**
 * I012: Lightweight Vector Store
 *
 * 设计目标：
 * - 零依赖：不引入 faiss / hnswlib / chromadb 等重量级库
 * - 持久化：向量以 JSON 存储在本地文件系统
 * - 支持无限记忆：通过语义检索只取 Top-K，context 不随记忆增长
 * - 自动分块：长记忆文本按段落切割，每段独立向量化
 *
 * 存储格式 (~/.devai/memory/vectors.json):
 * {
 *   "version": 1,
 *   "embeddingModel": "nomic-embed-text",
 *   "chunks": [
 *     {
 *       "id": "proj_abc123_user_0",
 *       "projectId": "abc123",
 *       "layer": "user",
 *       "text": "...",
 *       "vector": [0.1, 0.2, ...],
 *       "createdAt": 1234567890000,
 *       "updatedAt": 1234567890000
 *     }
 *   ]
 * }
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { EmbeddingVector, EmbeddingProvider } from "./embeddings.js";
import { cosineSimilarity } from "./embeddings.js";
import { logger } from "../utils/logger.js";
import { MEMORY_DIR } from "../config/settings.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const VECTOR_STORE_PATH = path.join(MEMORY_DIR, "vectors.json");
const STORE_VERSION = 1;

/** Max chars per chunk — longer text is split at paragraph boundaries */
const MAX_CHUNK_CHARS = 300;
/** Minimum chars for a chunk to be worth embedding */
const MIN_CHUNK_CHARS = 20;

// ── Types ─────────────────────────────────────────────────────────────────────

export type MemoryLayer = "user" | "context" | "decisions" | "learnings";

export interface VectorChunk {
  id: string;
  projectId: string;
  layer: MemoryLayer;
  text: string;
  vector: EmbeddingVector;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  chunk: VectorChunk;
  score: number;
}

interface StorageFormat {
  version: number;
  embeddingModel: string;
  chunks: VectorChunk[];
}

// ── VectorStore ───────────────────────────────────────────────────────────────

export class VectorStore {
  private chunks: VectorChunk[] = [];
  private embeddingModel = "unknown";
  private dirty = false;

  constructor(private storePath = VECTOR_STORE_PATH) {}

  // ── Load / Save ─────────────────────────────────────────────────────────────

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.storePath, "utf-8");
      const data = JSON.parse(raw) as StorageFormat;
      if (data.version !== STORE_VERSION) {
        logger.warn("vector_store.version_mismatch", { stored: data.version, current: STORE_VERSION });
      }
      this.chunks = data.chunks ?? [];
      this.embeddingModel = data.embeddingModel ?? "unknown";
      logger.debug("vector_store.loaded", { chunks: this.chunks.length });
    } catch {
      // First run — empty store
      this.chunks = [];
    }
  }

  async save(): Promise<void> {
    if (!this.dirty) return;
    await fs.mkdir(path.dirname(this.storePath), { recursive: true });
    const data: StorageFormat = {
      version: STORE_VERSION,
      embeddingModel: this.embeddingModel,
      chunks: this.chunks,
    };
    await fs.writeFile(this.storePath, JSON.stringify(data, null, 2), "utf-8");
    this.dirty = false;
    logger.debug("vector_store.saved", { chunks: this.chunks.length });
  }

  // ── Upsert ──────────────────────────────────────────────────────────────────

  /**
   * Index a memory layer's content for a project.
   * Splits text into chunks, embeds each, stores in the vector index.
   * Replaces any existing chunks for the same (projectId, layer).
   */
  async upsertMemoryLayer(
    projectId: string,
    layer: MemoryLayer,
    text: string,
    embedder: EmbeddingProvider,
  ): Promise<void> {
    if (!text.trim()) return;

    // Remove old chunks for this project+layer
    this.chunks = this.chunks.filter(
      (c) => !(c.projectId === projectId && c.layer === layer)
    );

    // Split into chunks
    const chunkTexts = chunkText(text);
    if (chunkTexts.length === 0) return;

    // Embed all chunks
    const vectors = await embedder.embedBatch(chunkTexts);
    this.embeddingModel = embedder.mode === "ollama" ? "nomic-embed-text" : "tfidf";

    const now = Date.now();
    for (let i = 0; i < chunkTexts.length; i++) {
      const id = makeChunkId(projectId, layer, i);
      this.chunks.push({
        id,
        projectId,
        layer,
        text: chunkTexts[i]!,
        vector: vectors[i]!,
        createdAt: now,
        updatedAt: now,
      });
    }

    this.dirty = true;
    logger.debug("vector_store.upsert", { projectId, layer, chunks: chunkTexts.length });
  }

  // ── Search ──────────────────────────────────────────────────────────────────

  /**
   * Find the most relevant memory chunks for a given query.
   *
   * @param queryVector  Embedding of the current user message
   * @param projectId    Only search within this project (+ global user memory)
   * @param topK         Max results to return
   * @param threshold    Minimum cosine similarity score (0–1)
   */
  search(
    queryVector: EmbeddingVector,
    projectId: string,
    topK = 8,
    threshold = 0.25,
  ): SearchResult[] {
    // Search project-specific chunks + global user layer
    const candidates = this.chunks.filter(
      (c) => c.projectId === projectId || c.layer === "user"
    );

    const scored = candidates.map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryVector, chunk.vector),
    }));

    return scored
      .filter((r) => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  stats(): { total: number; byLayer: Record<string, number>; projects: number } {
    const byLayer: Record<string, number> = {};
    const projects = new Set<string>();
    for (const c of this.chunks) {
      byLayer[c.layer] = (byLayer[c.layer] ?? 0) + 1;
      projects.add(c.projectId);
    }
    return { total: this.chunks.length, byLayer, projects: projects.size };
  }

  // ── Maintenance ─────────────────────────────────────────────────────────────

  /** Remove all chunks older than maxAgeMs that haven't been updated */
  pruneStale(maxAgeMs = 90 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    const before = this.chunks.length;
    this.chunks = this.chunks.filter((c) => c.updatedAt > cutoff);
    const pruned = before - this.chunks.length;
    if (pruned > 0) {
      this.dirty = true;
      logger.debug("vector_store.pruned", { pruned });
    }
    return pruned;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Split text into chunks at paragraph/bullet boundaries.
 * Keeps each chunk between MIN_CHUNK_CHARS and MAX_CHUNK_CHARS.
 */
function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length >= MIN_CHUNK_CHARS);

  const chunks: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_CHARS) {
      chunks.push(para);
      continue;
    }
    // Split long paragraphs at sentence boundaries
    const sentences = para.split(/(?<=[.!?。！？])\s+/);
    let current = "";
    for (const sent of sentences) {
      if (current.length + sent.length > MAX_CHUNK_CHARS && current.length >= MIN_CHUNK_CHARS) {
        chunks.push(current.trim());
        current = sent;
      } else {
        current = current ? `${current} ${sent}` : sent;
      }
    }
    if (current.length >= MIN_CHUNK_CHARS) chunks.push(current.trim());
  }

  return chunks;
}

function makeChunkId(projectId: string, layer: string, index: number): string {
  const hash = crypto
    .createHash("sha1")
    .update(`${projectId}:${layer}:${index}:${Date.now()}`)
    .digest("hex")
    .slice(0, 8);
  return `${projectId}_${layer}_${hash}`;
}
