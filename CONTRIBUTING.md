# Contributing to Seed AI

Thank you for your interest in contributing to Seed AI. This document explains how to participate in the project under the MIT License.

---

## License

By contributing to Seed AI, you agree that your contributions will be licensed under the same **MIT License** that covers the project. See [LICENSE](LICENSE) for the full text.

All dependencies used by Seed AI are MIT or Apache 2.0 licensed — there are no GPL-licensed dependencies, so there is no copyleft propagation risk:

| Dependency | License |
|------------|---------|
| Anthropic SDK | MIT |
| Ink 4 | MIT |
| React | MIT |
| Zod | MIT |
| tsup / esbuild | MIT |
| Vitest | MIT |
| nomic-embed-text (Ollama) | Apache 2.0 |

---

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/seed-ai.git
cd seed-ai
npm install
npm run build       # tsup — builds in <2s
npm run dev         # watch mode
npm run typecheck   # tsc --noEmit (strict mode, zero errors required)
npm run test:run    # Vitest unit tests
npm link            # install `seed` globally for manual testing
```

---

## Where Contributions Matter Most

| Area | Priority | Notes |
|------|----------|-------|
| Integration tests (agent loop end-to-end) | High | Biggest quality gap — live API calls welcome |
| Windows-specific edge cases | High | Path handling, terminal encoding, Docker Desktop |
| Local LLM provider testing | Medium | Ollama model quirks, LM Studio, vLLM |
| Bug reports with reproduction steps | Always welcome | Open a GitHub Issue |

---

## Innovation Numbering

Innovations are numbered **I001–I016** (I001–I013 + I016 delivered; I014 dropped; I015 next).

- New innovations that extend the system should claim the next available number (I017+)
- Bug fixes and UI improvements do **not** consume an innovation number
- Document new innovations in `WHITEPAPER.md` Section 4, and record the operation in `OPERATIONS.md`

---

## Code Standards

- **TypeScript strict mode** — `noImplicitAny: true`. Zero type errors required before merge.
- **Zod schemas** for all tool inputs and configuration — never trust raw LLM output.
- **No speculative abstractions** — implement what the task requires, not what might be needed later.
- **No backwards-compatibility shims** — if something is unused, delete it.
- **Layered error handling** — tools never throw; they return `{ content, isError: true }`.
- **Security** — no command injection, no path traversal, no hardcoded secrets.

---

## Pull Request Checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run test:run` passes
- [ ] `npm run build` succeeds
- [ ] If adding a new innovation: entry added to `WHITEPAPER.md` Section 4 and `MEMORY.md`
- [ ] If fixing a bug: entry added to `WHITEPAPER.md` Section 7.1 defect table
- [ ] No new `any` types without justification
- [ ] No GPL-licensed dependencies added

---

## What We Will Not Merge

- Breaking changes to the `AIProvider` interface without a migration path
- Hard-coded provider API keys or credentials
- Features that require a specific OS or terminal to function (unless gracefully degraded)
- Speculative features not tied to a concrete use case

---

## Reporting Bugs

Open a [GitHub Issue](../../issues) with:
1. OS and terminal (e.g. Windows 11, Windows Terminal v1.x)
2. Node.js version (`node --version`)
3. Provider and model being used
4. Exact steps to reproduce
5. Expected vs. actual behavior

For security vulnerabilities, see [SECURITY.md](SECURITY.md).
