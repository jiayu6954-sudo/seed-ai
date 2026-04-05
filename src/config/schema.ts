import { z } from "zod";

const PermissionLevelSchema = z.enum(["auto", "ask", "deny"]);

export const SettingsSchema = z.object({
  /** AI provider to use */
  provider: z
    .enum(["anthropic", "openai", "deepseek", "groq", "gemini", "ollama", "openrouter", "moonshot", "custom"])
    .default("anthropic"),

  model: z
    .string()
    .default("claude-sonnet-4-6"),

  maxTokens: z.number().int().min(1024).max(128000).default(16000),

  tokenBudget: z
    .object({
      warningThreshold: z.number().min(0).max(100).default(80),
      hardLimit: z.number().optional(),
    })
    .default({}),

  defaultPermissions: z
    .object({
      bash: PermissionLevelSchema.default("ask"),
      file_write: PermissionLevelSchema.default("ask"),
      file_edit: PermissionLevelSchema.default("ask"),
      file_read: PermissionLevelSchema.default("auto"),
      glob: PermissionLevelSchema.default("auto"),
      grep: PermissionLevelSchema.default("auto"),
      web_fetch: PermissionLevelSchema.default("ask"),
    })
    .default({}),

  customRules: z
    .array(
      z.object({
        tool: z.union([
          z.enum(["bash", "file_read", "file_write", "file_edit", "glob", "grep", "web_fetch"]),
          z.literal("*"),
        ]),
        level: PermissionLevelSchema,
      })
    )
    .default([]),

  ui: z
    .object({
      theme: z.enum(["dark", "light", "auto"]).default("auto"),
      showThinking: z.boolean().default(false),
      showTokenCount: z.boolean().default(true),
      showCost: z.boolean().default(true),
    })
    .default({}),

  context: z
    .object({
      maxHistoryMessages: z.number().int().min(2).default(50),
      compactionThreshold: z.number().min(50).max(95).default(80),
      claudeMdPaths: z.array(z.string()).default([]),
    })
    .default({}),

  // ── API Keys (per provider) ────────────────────────────────────────────────
  /** Anthropic API key */
  apiKey: z.string().optional(),
  /** OpenAI API key */
  openaiApiKey: z.string().optional(),
  /** DeepSeek API key */
  deepseekApiKey: z.string().optional(),
  /** Groq API key */
  groqApiKey: z.string().optional(),
  /** Google Gemini API key */
  geminiApiKey: z.string().optional(),
  /** OpenRouter API key */
  openrouterApiKey: z.string().optional(),
  /** Moonshot/Kimi API key */
  moonshotApiKey: z.string().optional(),

  // ── Custom OAI-compatible endpoint ────────────────────────────────────────
  /** Base URL for provider=custom or provider=ollama override */
  customProviderUrl: z.string().optional(),
  /** API key for provider=custom */
  customProviderKey: z.string().optional(),

  // ── Long-term memory (I007 + I012) ───────────────────────────────────────
  memory: z
    .object({
      /** Enable automatic memory extraction after each session */
      enabled: z.boolean().default(true),
      /** Max chars of conversation fed to extractor (cost control) */
      maxConversationChars: z.number().int().min(2000).max(40000).default(12000),
      /** I012: Enable semantic retrieval (vector search) instead of full injection */
      semanticRetrieval: z.boolean().default(true),
      /** I012: Ollama embedding model (nomic-embed-text recommended) */
      embeddingModel: z.string().default("nomic-embed-text"),
      /** I012: Max memory chunks to inject per query */
      topK: z.number().int().min(1).max(30).default(8),
      /** I012: Minimum cosine similarity threshold (0–1) */
      similarityThreshold: z.number().min(0).max(1).default(0.25),
    })
    .default({}),

  // ── Local model (I011) ────────────────────────────────────────────────────
  localModel: z
    .object({
      /** Auto-discover running local model services (Ollama, LM Studio, etc.) */
      autoDiscover: z.boolean().default(true),
      /** Force a specific local service URL (overrides auto-discovery) */
      serviceUrl: z.string().optional(),
      /** I013: Use local model for memory extraction instead of Haiku */
      useForMemory: z.boolean().default(false),
      /** Local model name to use for memory extraction */
      memoryModel: z.string().default("qwen2.5:7b"),
    })
    .default({}),

  // ── Sandbox (Innovation 5) ────────────────────────────────────────────────
  sandbox: z
    .object({
      /** Enable Docker sandbox isolation for bash commands */
      enabled: z.boolean().default(false),
      /** Isolation level: strict (cwd read-only, no net) | standard | permissive */
      level: z.enum(["strict", "standard", "permissive"]).default("standard"),
      /** Docker image to use as execution environment */
      image: z.string().default("node:20-slim"),
      /** Per-command timeout in milliseconds */
      timeoutMs: z.number().int().min(1000).max(300_000).default(30_000),
      /** Container memory limit in MB */
      maxMemoryMb: z.number().int().min(64).max(4096).default(512),
      /** Allow outbound network access from container */
      allowNetwork: z.boolean().default(true),
    })
    .default({}),

  // ── MCP (Model Context Protocol) servers ──────────────────────────────────
  mcpServers: z
    .array(
      z.object({
        name: z.string(),
        transport: z.enum(["stdio", "http"]),
        command: z.string().optional(),
        args: z.array(z.string()).optional(),
        env: z.record(z.string()).optional(),
        url: z.string().optional(),
      })
    )
    .default([]),
});

export type SeedSettings = z.infer<typeof SettingsSchema>;
