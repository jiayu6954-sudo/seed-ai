import { execa } from "execa";
import type { BashInput, ToolResult, ToolExecutionContext } from "../types/tools.js";
import { logger } from "../utils/logger.js";

/** I009-F: Match Claude Code's BASH_MAX_OUTPUT_DEFAULT — char-based, not byte-based */
const MAX_OUTPUT_CHARS = 30_000;
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 300_000;

export async function executeBash(
  input: BashInput,
  ctx: ToolExecutionContext
): Promise<ToolResult> {
  const timeoutMs = Math.min(
    input.timeout ?? DEFAULT_TIMEOUT_MS,
    MAX_TIMEOUT_MS
  );

  logger.debug("bash.execute", { command: input.command, timeoutMs });

  try {
    // On Windows use PowerShell (always available on Win10/11).
    // Wrap the user command in $null = ... or Out-Null for noisy cmdlets so
    // AI doesn't mistake verbose directory/file metadata for an error.
    // -NoProfile -NonInteractive: faster startup, no blocking prompts.
    const [shell, shellArgs] = process.platform === "win32"
      ? ["powershell.exe", [
          "-NoProfile", "-NonInteractive",
          "-Command",
          // Set ErrorActionPreference so errors surface as text (exit 1)
          // rather than red-stream exceptions that don't reach 'all'.
          `$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; ${input.command}`,
        ]]
      : ["bash", ["-c", input.command]];

    const result = await execa(shell, shellArgs, {
      cwd: ctx.cwd,
      timeout: timeoutMs,
      reject: false,           // Don't throw on non-zero exit
      all: true,               // Combine stdout + stderr into `all`
      maxBuffer: MAX_OUTPUT_CHARS * 4, // bytes; 4× for worst-case UTF-8
      cleanup: true,           // Kill child on parent exit
      cancelSignal: ctx.signal as AbortSignal | undefined,
    });

    const rawOutput = result.all ?? result.stdout + result.stderr;
    const truncated = rawOutput.length > MAX_OUTPUT_CHARS;
    const output = truncated ? rawOutput.slice(0, MAX_OUTPUT_CHARS) : rawOutput;

    const content = [
      output.length > 0 ? output : "(no output)",
      truncated ? `\n[Output truncated at ${MAX_OUTPUT_CHARS.toLocaleString()} chars]` : "",
      `\n[Exit code: ${result.exitCode ?? "unknown"}]`,
    ]
      .filter(Boolean)
      .join("");

    logger.debug("bash.result", {
      exitCode: result.exitCode,
      outputLen: rawOutput.length,
      truncated,
    });

    return {
      content,
      isError: (result.exitCode ?? 0) !== 0,
      metadata: {
        exitCode: result.exitCode ?? undefined,
        truncated,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { content: "Command aborted by user.", isError: true };
    }
    if (err instanceof Error && err.message.includes("timed out")) {
      return {
        content: `Command timed out after ${timeoutMs}ms.`,
        isError: true,
        metadata: { exitCode: 124 },
      };
    }
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("bash.error", err);
    return { content: `bash error: ${msg}`, isError: true };
  }
}
