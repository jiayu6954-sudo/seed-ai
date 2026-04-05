# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| v0.9.x (latest) | Yes |
| < v0.9.0 | No |

---

## Sandbox Limitations

Seed AI includes a Docker-based sandbox (I005) for isolating bash tool execution. **Important limitations:**

### When sandbox is disabled (default)
- `bash` tool commands execute directly on your host machine with your user's permissions
- Any file path accessible to your user account can be read or written
- This is intentional for the default "developer trusting local LLM" use case
- **Do not run Seed AI with `--allow-all` on untrusted codebases**

### When sandbox is enabled (`sandbox.enabled: true`)
- Bash commands run inside a Docker container with:
  - Read-only filesystem mounts (strict mode)
  - No network access (strict mode)
  - Memory and CPU limits
  - `--security-opt no-new-privileges`
- File edits and reads still happen on the host (only bash is sandboxed)
- Docker Desktop must be running on Windows

### Prompt Injection Risk
Large language models can be manipulated by malicious content in files they read (prompt injection). Seed AI mitigates this by:
- Requiring explicit user approval for destructive tool calls (by default)
- Displaying all tool calls and results in the UI before and after execution
- Planned: I015 Hooks system will execute inside the Docker sandbox to prevent hook-based privilege escalation

**Recommendation:** Always review tool permission prompts carefully when processing untrusted code or documents.

---

## Reporting a Vulnerability

If you discover a security vulnerability in Seed AI:

1. **Do not** open a public GitHub Issue for security vulnerabilities
2. Open a [GitHub Security Advisory](../../security/advisories/new) (private disclosure)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within **7 days** and to release a fix within **30 days** for confirmed vulnerabilities.

---

## Dependency Security

All production dependencies are MIT or Apache 2.0 licensed with no known CVEs at time of release. Run `npm audit` to check for newly discovered vulnerabilities in dependencies.

Key dependencies and their security posture:

| Dependency | Role | Notes |
|------------|------|-------|
| `@anthropic-ai/sdk` | LLM API | Official Anthropic SDK, actively maintained |
| `ink` | Terminal UI | Read-only rendering, no network access |
| `zod` | Input validation | All tool inputs validated before execution |
| `dockerode` | Docker sandbox | Sandbox manager only, never exposes daemon socket to LLM |

---

## API Key Security

Seed AI stores API keys in `~/.seed/settings.json` (or `$SEED_DATA_DIR/settings.json`):
- File permissions: user-only read/write (600 on Unix)
- Keys are never logged, never included in session files, never sent to any service other than the configured provider endpoint
- Use environment variables (`ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, etc.) as an alternative to storing keys in the settings file
