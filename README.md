# Seed AI

**A production-grade TypeScript CLI AI coding assistant — built from scratch with 14 delivered innovations beyond Claude Code.**

> Not a wrapper. Not a clone. A ground-up reimplementation that systematically analyzed Claude Code's architecture and design patterns, then shipped measurable improvements in every critical dimension.

> **Status:** Active development. Unit tests cover core modules; integration tests are limited — contributions welcome. See [Quality & Testing](#quality--testing).

## Demo

<!-- After publishing: drag-and-drop the video into any GitHub Issue comment,
     copy the generated CDN URL, and replace the line below with it.
     GitHub will render it as an inline video player automatically. -->

> Demo video coming soon — full walkthrough: streaming output, parallel tool execution, real-time diff rendering, model switching, long-term memory recall.

---

## Why Seed AI?

| Problem | Seed AI's answer |
|---------|---------------|
| Locked into Anthropic's API | 8 providers: OpenAI, DeepSeek, Groq, Gemini, Ollama, OpenRouter, Moonshot, custom |
| API costs spiral out of control | Tool result cache + LLM compression + local Ollama = 70–90% token reduction in typical sessions |
| AI forgets everything between sessions | 3-layer long-term memory + semantic vector retrieval (constant ~800 tokens) |
| Local LLMs need manual plumbing | Auto-discover Ollama/LM Studio/vLLM, detect tool support, fall back to XML tool calls |
| `fetch()` breaks on half the web | Native fetch with automatic `curl` fallback — BBC News, Sina Finance all work |
| Docker unavailable = crash | Graceful host fallback with sandbox-aware system prompt |
| Repeated file reads waste time | Session-level tool result cache, write-before-invalidate ordering |
| Context window fills up silently | Haiku-powered semantic compression with cumulative summary injection |

---

## Features

### Core Agent Engine
- **Parallel tool execution** — permissions collected serially (clear UX), execution via `Promise.allSettled()` — N×T latency → ~1.2×T
- **Session-level tool cache** — idempotent reads (`file_read`, `glob`, `grep`, `web_fetch`) cached; write ops invalidate before execution to prevent stale reads
- **LLM-driven context compression** — triggers at 80% context window; Haiku ($0.0002/compress) summarizes pruned messages into system prompt; multi-round cumulative summaries preserved
- **Token Budget Guard** — natural language budget (`"+500k"`, `"2M tokens"`) parsed inline, hard limit enforced per loop iteration
- **50-iteration loop** with Ctrl+C abort, streaming output, real-time diff rendering

### Multi-Provider Support
```bash
seed config model                        # interactive menu — 8 providers, key status shown
seed config model --deepseek             # quick switch to DeepSeek cloud
seed config model --local                # Ollama auto-discover
seed config model --anthropic --set-model claude-opus-4-6
```
Supported: `anthropic` · `openai` · `deepseek` · `groq` · `gemini` · `openrouter` · `ollama` (local) · `moonshot` · custom URL

### Smart Local Model Layer (I011)
Ollama / LM Studio / llama.cpp / vLLM — zero config required:
1. Auto-discover running services on standard ports (11434, 1234, 8080, 8000)
2. Detect tool-call capability (dry-run probe + pattern matching)
3. Native tool calls if supported; XML `<tool_call>` fallback if not
4. Handle vendor-specific quirks (e.g. Ollama R1 strips `<think>` opening tags)

Example: `ollama pull qwen2.5-coder:7b` then `seed config model --local` — Seed AI detects the model, confirms tool-call support, and starts immediately. No config file edits.

### Long-Term Memory (I007 + I012)
Automatically persists and retrieves knowledge **across sessions**:
```
~/.seed/memory/
├── user.md                    ← cross-project user profile
└── projects/{sha1}/
    ├── context.md             ← tech stack, architecture
    ├── decisions.md           ← key decisions + reasoning
    └── learnings.md           ← bugs fixed, patterns that worked
```
- **Auto-extraction**: Haiku distills only durable knowledge at session end (not ephemeral variable values)
- **Semantic vector retrieval** (I012): embed query → cosine similarity → inject top-8 relevant chunks (~800 tokens constant, regardless of total memory size)
- TF-IDF offline fallback when Ollama embedding service unavailable
- `pruneStale()` auto-cleans chunks older than 90 days

### Resilient Web Fetch
```
native fetch (15s timeout)
    └── on timeout/connection error → curl.exe fallback
            ├── charset-aware decode (GBK, GB2312, UTF-8...)
            ├── 10MB buffer
            └── shared result pipeline (HTML strip, JSON parse)
```

### Docker Sandbox (I005)
Three isolation levels: `strict` (read-only FS + no network) · `standard` · `permissive`  
Graceful host fallback when Docker is unavailable — never crashes, always notifies.

### Storage Guard (I016)
Auto-runs at startup (non-blocking). Prevents unbounded disk growth:

| Category | Quota | Strategy |
|----------|-------|---------|
| `vectors.json` | 200 MB | Delete oldest 30% chunks |
| Session files | 100 files | FIFO eviction |
| `debug.log` | 10 MB | Keep last 5 MB |

```bash
seed config show --storage        # color-coded quota dashboard (green/yellow/red)
SEED_DATA_DIR=F:/seed-data seed        # relocate all data off the system drive (C:)
```

### Terminal UI
- Ink 4 (React) component architecture
- **Static/Dynamic split rendering** — completed messages written to terminal scrollback once via Ink `<Static>` (never redrawn); only the live streaming zone (~TAIL_LINES + 8 chrome lines) repaints every 80 ms — eliminates streaming jitter
- `tailMessage()` caps streaming output to `termRows - 8` lines (≈22 on a standard 30-row terminal) — large enough to read, safe from cursor-tracking overflow
- Precise `rgb()` color system — identical across all terminals and themes (no ANSI color override)
- Real-time diff rendering (green `+` / red `-`) — color values sourced directly from Claude Code's theme
- Shift+Enter multiline input (kitty keyboard protocol + xterm modifyOtherKeys)
- Braille spinner during tool execution; status bar with live token/cost/budget/elapsed tracking
- Primary buffer (not alternate screen) — terminal scrollback preserved, scrollbar works normally

### Slash Commands
| Command | Description |
|---------|-------------|
| `/clear` | Reset context |
| `/compact` | Force LLM compression |
| `/cost` | Token usage + estimated cost |
| `/help` | All commands and shortcuts |
| `/model` | Current provider/model |
| `/memory` | Loaded memory entries |

---

## Installation

### Prerequisites
- Node.js ≥ 20 (recommend 24+ for native fetch performance)
- npm ≥ 9

### From source
```bash
git clone https://github.com/YOUR_USERNAME/seed-ai.git
cd seed-ai
npm install
npm run build
npm link          # makes `seed` available globally

# Verify
seed --version
```

### Quick start — Anthropic
```bash
export ANTHROPIC_API_KEY=sk-ant-...
seed setup       # interactive wizard
seed
```

### Quick start — DeepSeek (cost-effective cloud)
```bash
export DEEPSEEK_API_KEY=sk-...
seed config model --deepseek --set-model deepseek-chat
seed
```

### Quick start — Local (zero API cost)
```bash
# 1. Install and start Ollama  https://ollama.com
ollama pull qwen2.5-coder:7b    # tool-call capable, good for code tasks
# or: ollama pull llama3.2:3b  # smaller, faster

# 2. Point Seed AI at it
seed config model --local
seed
```
Seed AI auto-discovers the Ollama service and selects from installed models — no config editing required.

---

## Usage

```bash
# Interactive REPL
seed

# Single prompt (pipe/headless mode)
echo "explain this function" | seed

# Resume a previous session
seed --session abc123

# Override model for one run
seed -m claude-opus-4-6

# Read-only mode (no writes or exec)
seed --deny-all

# Auto-approve all tool permissions
seed --allow-all

# Relocate runtime data to another drive
SEED_DATA_DIR=F:/seed-data seed
```

### In-session shortcuts
| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Ctrl+C` | Interrupt agent / exit |
| `Esc` | Cancel pending input |

---

## Configuration

Settings stored at `~/.seed/settings.json` (or `$SEED_DATA_DIR/settings.json`):

```bash
seed config show               # formatted config summary
seed config show --json        # raw JSON
seed config show --storage     # storage quota dashboard
seed config set maxTokens 8192
seed config set memory.enabled false
seed config set sandbox.enabled true
seed config reset              # restore defaults
```

Key settings:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "maxTokens": 16384,
  "memory": { "enabled": true },
  "sandbox": { "enabled": false },
  "ui": { "showThinking": true }
}
```

`SEED_DATA_DIR` — set this environment variable to move all Seed AI data (memory, sessions, logs) off your system drive. Useful when the system partition is nearly full.

---

## Known Limitations

- **SPA / JavaScript-rendered content**: `web_fetch` fetches initial HTML only; React/Vue/Angular apps return the shell, not the dynamic data. Puppeteer-level tooling is out of scope for a CLI assistant.
- **Heavy bot protection**: DataDome, Cloudflare Enterprise Bot Management are not bypassable without a full browser fingerprint (TLS characteristics, JS execution, behavioral analysis).
- **Docker requires manual start**: On Windows, Docker Desktop must be running before use if `sandbox.enabled=true`. Seed AI cannot start the Docker daemon automatically.
- **Docker on Windows**: Requires WSL2 integration and drive sharing configured in Docker Desktop settings.
- **Local LLM tool calls**: Reasoning-focused models (e.g. DeepSeek-R1) rarely emit tool-call syntax reliably. Use tool-capable models: `qwen2.5-coder`, `llama3.1`, `mistral` for code tasks.

---

## Architecture

```
CLI (index.ts)
    └── Ink TUI  ←→  useAgentLoop (React hook)
                          ├── Token Budget Parser (I010)
                          └── runAgentLoop (loop.ts)
                                ├── SystemPrompt (static/dynamic split, I009)
                                ├── AIProvider (8 implementations)
                                │     └── SmartLocalProvider (I011)
                                ├── ToolRegistry
                                │     ├── Cache (I002)
                                │     ├── Sandbox (I005)
                                │     └── MCPRegistry (I006)
                                └── ContextManager (I003 compression, triggers at 80%)

Memory Layer
    ├── LongTermMemory (I007)   ~/.seed/memory/
    └── VectorStore (I012)      ~/.seed/memory/vectors.json
```

---

## Comparison with Claude Code

### Seed AI leads

| Dimension | Seed AI | Claude Code |
|-----------|-------|-------------|
| **Providers** | 8+ (Anthropic, OpenAI, DeepSeek, Groq, Gemini, Ollama, OpenRouter, Moonshot) | Anthropic only |
| **Local LLMs** | Auto-discover, tool-cap probe, XML fallback | None |
| **Long-term memory** | 3-layer, Haiku extraction, semantic vector search | None |
| **Tool result cache** | Session-level, write-before-invalidate | None |
| **web_fetch fallback** | native → curl auto-downgrade, charset-aware | None |
| **Context compression** | LLM-powered semantic summary at 80% window | Simple truncation |
| **Token budget** | Natural language: `"+500k"`, `"2M tokens"` | Static config only |
| **Docker sandbox** | 3 isolation levels + graceful host fallback | None |
| **Storage quotas** | Auto-enforced + SEED_DATA_DIR relocation | None |
| **Model switching** | Interactive menu + single-command flags | None |
| **MCP** | **Client** + registry + lifecycle management | **Server** only |

### Claude Code leads

| Dimension | Claude Code advantage | Seed AI roadmap |
|-----------|----------------------|---------------|
| **Hooks system** | `PreToolUse` / `PostSampling` programmable hooks | I015 — next priority |
| **Plan Mode** | Read-only planning mode | Planned |
| **VSCode integration** | Full IDE extension + inline code | Out of scope (CLI-first positioning) |
| **Permission granularity** | Tool-level + path-level, session learning | Iterating |
| **Test coverage / maturity** | Large-scale production validation | See below |

---

## Quality & Testing

```bash
npm run test:run    # Vitest unit tests
npm run typecheck   # tsc --noEmit, strict mode
```

- Unit tests cover core modules: permissions, tool cache, context compression, cost tracking, sandbox, vector store, token budget parser, storage guard.
- **Integration tests are currently limited** — end-to-end agent loop tests against live APIs are a known gap.
- Contributions that add integration test coverage are especially welcome. See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

---

## Roadmap

| ID | Feature | Status |
|----|---------|--------|
| I001–I013 | Parallel exec, cache, LLM compression, memory, sandbox, MCP, budget, system prompt, local LLM, vector memory, model switcher | Done |
| I016 | Storage Guard + SEED_DATA_DIR | Done (v0.9.1) |
| ~~I014~~ | ~~Out-of-process LLM compression~~ | Dropped — I012 fixed the root cause; UI Spinner handles the rare freeze |
| I015 | Hooks system: `PreToolUse` / `PostToolUse` shell scripts, executed inside Docker sandbox (security constraint) | Next |
| — | Plan Mode: read-only planning, no tool execution until user confirms | Planned |
| — | Integration test suite | Help wanted |

> **v0.9.1-r6** — Streaming rendering architecture finalized: Static/Dynamic split, isStreaming atomization fix, TAIL_LINES sized to viewport.

---

## Contributing

We welcome bug reports, feature ideas, and pull requests. Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) for:

- Development setup (build, dev mode, typecheck, tests)
- Innovation numbering conventions (I001–I016 done; I015 is next)
- Code standards: TypeScript strict, Zod schemas, layered error handling, no speculative abstractions
- PR checklist and what we will not merge

**Where contributions matter most right now:**
- Integration tests for the agent loop (end-to-end with real API calls)
- Windows-specific edge cases (path handling, terminal encoding)
- Additional local LLM provider testing

---

## Acknowledgments

Seed AI was built by systematically studying Claude Code's architecture, design patterns, and engineering decisions. The color system, diff rendering values, and MCP protocol integration are informed by that study. This project stands on the shoulders of Anthropic's engineering work — the goal is to push the open-source ecosystem forward, not to compete with or diminish it.

14 delivered innovations (I001–I013, I016) are fully documented in [WHITEPAPER.md](WHITEPAPER.md). I014 was evaluated and dropped; I015 (Hooks system) is the next priority.

---

## License

MIT — see [LICENSE](LICENSE).
