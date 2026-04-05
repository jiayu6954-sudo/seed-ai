import type { ToolInput, BashInput, FileWriteInput } from "../types/tools.js";
import type { RiskLevel } from "../types/permissions.js";

// Patterns that indicate a dangerous bash command
const DANGEROUS_BASH_PATTERNS: RegExp[] = [
  /rm\s+(-[rRf]{1,3}|--recursive|--force)/i,
  /:\s*\(\s*\)\s*\{\s*:\|:\s*&\s*\}/,     // fork bomb
  /dd\s+if=/,
  /mkfs\./,
  />\s*\/dev\/sd[a-z]/,
  /chmod\s+-R\s+777/,
  /curl[^|]*\|\s*(ba?sh|sh|zsh)/i,
  /wget[^|]*\|\s*(ba?sh|sh|zsh)/i,
  /eval\s*\(/,
  /shutdown|reboot|halt/,
  /pkill|killall/,
  /DROP\s+TABLE|DROP\s+DATABASE/i,
  /git\s+push\s+.*--force/,
  /git\s+reset\s+--hard/,
];

// Patterns that are moderately risky
const MODERATE_BASH_PATTERNS: RegExp[] = [
  /rm\s+/,
  /mv\s+/,
  /cp\s+-r/i,
  /chmod\s+/,
  /chown\s+/,
  /sudo\s+/,
  /npm\s+(install|uninstall|publish)/,
  /yarn\s+(add|remove|publish)/,
  /pip\s+(install|uninstall)/,
  /apt(-get)?\s+(install|remove|purge)/,
  /git\s+(commit|push|merge|rebase|reset)/,
  /docker\s+(rm|rmi|stop|kill)/,
];

// Safe-looking system paths that should never be written to
const PROTECTED_WRITE_PATHS = [
  "/etc/",
  "/usr/",
  "/bin/",
  "/sbin/",
  "/boot/",
  "/sys/",
  "/proc/",
  "C:\\Windows\\",
  "C:\\Program Files",
];

export function classifyRisk(toolName: string, input: ToolInput | Record<string, unknown>): RiskLevel {
  switch (toolName) {
    case "bash": {
      const cmd = (input as BashInput).command;
      if (DANGEROUS_BASH_PATTERNS.some((p) => p.test(cmd))) return "dangerous";
      if (MODERATE_BASH_PATTERNS.some((p) => p.test(cmd))) return "moderate";
      return "safe";
    }

    case "file_write": {
      const p = (input as FileWriteInput).path;
      if (PROTECTED_WRITE_PATHS.some((prefix) => p.startsWith(prefix))) {
        return "dangerous";
      }
      return "moderate";
    }

    case "file_edit":
      return "moderate";

    case "file_read":
    case "glob":
    case "grep":
      return "safe";

    case "web_fetch":
      return "safe";

    default:
      return "moderate";
  }
}

export function describeAction(toolName: string, input: ToolInput | Record<string, unknown>): string {
  switch (toolName) {
    case "bash":
      return `Run: ${(input as BashInput).command}`;
    case "file_read":
      return `Read: ${(input as { path: string }).path}`;
    case "file_write":
      return `Write: ${(input as FileWriteInput).path}`;
    case "file_edit":
      return `Edit: ${(input as { path: string }).path}`;
    case "glob":
      return `Glob: ${(input as { pattern: string }).pattern}`;
    case "grep":
      return `Search: ${(input as { pattern: string }).pattern}`;
    case "web_fetch":
      return `Fetch: ${(input as { url: string }).url}`;
    default:
      return `Execute: ${toolName as string}`;
  }
}
