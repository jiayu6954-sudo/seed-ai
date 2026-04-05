# Contributing to Seed AI

Seed AI is a research-grade CLI AI assistant built by studying Claude Code's full TypeScript source and implementing measurable improvements. Contributions are welcome — but this project has strong opinions about scope and quality.

---

## Before you start

Read the [WHITEPAPER.md](../WHITEPAPER.md) — it explains every architectural decision. If your change touches an area described there, understand *why* the current design exists before proposing an alternative.

---

## Development setup

### Prerequisites

- Node.js 20+ (24+ recommended for native fetch)
- npm 9+
- TypeScript knowledge (strict mode, NodeNext modules)

### Clone and build

```bash
git clone https://github.com/YOUR_USERNAME/seed.git
cd seed
npm install
npm run build          # tsup — under 2s
npm link               # makes `seed` available globally
```

### Run in dev mode (no rebuild needed)

```bash
npm run dev            # tsx src/index.ts
npm run dev -- "prompt here"
```

### Type check

```bash
npm run typecheck      # tsc --noEmit, must pass with zero errors
```

### Tests

```bash
npm test               # vitest watch
npm run test:run       # single pass (CI)
```

---

## Project structure

```
src/
├── agent/          # Loop, stream handler, context compression, system prompt
├── tools/          # 7 native tools + cache + registry
├── ui/             # Ink components, theme, hooks
├── providers/      # AIProvider interface + 8 implementations
├── permissions/    # Per-tool permission management
├── mcp/            # MCP client + registry
├── sandbox/        # Docker sandbox manager
├── memory/         # Long-term memory + vector store + embeddings
├── storage/        # Storage Guard (I016)
├── config/         # Zod schema + settings loader
├── commands/       # Slash command system
├── cli/commands/   # CLI subcommands (config, sessions, run, chat)
└── utils/          # logger, stats, cost-calculator, token-budget-parser
```

---

## Code standards

### TypeScript — no exceptions

- `strict: true`, `noImplicitAny: true` — all new code must compile clean
- Use Zod for any data validated at runtime (user input, LLM output, API responses)
- Prefer `interface` for structural types, `type` for unions/aliases

### Error handling

Follow the existing layered model:

| Layer | Rule |
|-------|------|
| Tool layer | `try/catch` → return `{ content, isError: true }` — never throw |
| Agent loop | Tool failures continue the loop — LLM adjusts based on error message |
| Memory/MCP | Non-fatal errors degrade gracefully (warn + continue) |
| Sandbox | Docker unavailable → host fallback + user notification |

Do not add `try/catch` blocks that silently swallow errors without at minimum a `logger.warn()`.

### No speculative abstractions

- Write code for what the task actually requires
- Three similar lines of code is better than a premature abstraction
- Do not add helpers, utilities, or wrappers for one-time use

### Comments

Only comment logic that isn't self-evident. Innovation numbers (`// I001`, `// I016`) are the exception — they link code to the whitepaper and must be preserved.

---

## Making changes

### Bug fixes

1. Open an issue first (use the bug template) unless the fix is trivial
2. Write a failing test case if possible
3. Fix the root cause — don't paper over it with a fallback

### New features

1. Open a feature request issue and get feedback before writing code
2. Large features (new subsystem, new innovation) require discussion on scope
3. New innovations get an I0XX number — check WHITEPAPER.md Section 10 for the next available ID

### Innovation numbering

| Range | Meaning |
|-------|---------|
| I001–I013, I016 | Delivered (14 innovations) |
| I014 | Evaluated and permanently dropped — I012 resolved the root cause |
| I015 | Next priority: Hooks system (PreToolUse / PostToolUse, sandboxed) |
| I017+ | Your proposed innovation — discuss in issue first |

UI fixes and bug fixes do not consume innovation numbers.

---

## Pull request checklist

Before opening a PR:

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run test:run` passes
- [ ] `npm run build` succeeds
- [ ] No new `any` types introduced without justification
- [ ] Error handling follows the layered model above
- [ ] If touching the agent loop, system prompt, or provider layer — tested end-to-end with a real API call
- [ ] If adding a new innovation: WHITEPAPER.md Section 4 updated with technical details
- [ ] PR description explains *why*, not just *what*

### PR scope

Keep PRs focused. One logical change per PR. Do not bundle bug fixes with feature additions.

---

## What we will not merge

- Changes that add emoji to output (unless behind a config flag)
- Changes that break existing CLI flags or settings schema without migration path
- Abstractions added "for future use" with no current consumer
- Disabling TypeScript strict checks to avoid fixing type errors
- Silent error swallowing
- Features that duplicate what's already in the roadmap without prior discussion

---

## Reporting security issues

Do not open a public issue for security vulnerabilities. Email the maintainer directly or use GitHub's private vulnerability reporting. Include reproduction steps, impact assessment, and suggested fix if you have one.

---

## Questions

Open a [Discussion](../../discussions) for questions that aren't bugs or feature requests. Check existing discussions and issues first.
