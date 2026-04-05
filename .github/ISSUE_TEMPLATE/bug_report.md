---
name: Bug report
about: Something is broken or behaving unexpectedly
title: "[BUG] "
labels: bug
assignees: ''
---

## Describe the bug

A clear and concise description of what is broken.

## Steps to reproduce

1. Run `seed ...`
2. Enter prompt: `...`
3. See error

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Paste the exact error message or unexpected output.

## Debug log

Run with `--verbose` and attach the relevant section of `~/.seed/debug.log` (or `$SEED_DATA_DIR/debug.log`):

```
seed --verbose "your prompt"
```

<details>
<summary>debug.log excerpt</summary>

```
paste log here
```

</details>

## Environment

| Field | Value |
|-------|-------|
| seed version | `seed --version` output |
| Node.js version | `node --version` |
| OS | Windows 11 / macOS / Linux |
| Provider | anthropic / deepseek / ollama / ... |
| Model | e.g. claude-sonnet-4-6 |
| Ollama version (if applicable) | `ollama --version` |

## Config (sanitize API keys)

```bash
seed config show --json
```

```json
paste output here (remove API keys)
```

## Additional context

Any other context — terminal type, Docker availability, network environment, etc.
