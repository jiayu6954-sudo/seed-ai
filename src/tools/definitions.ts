import type { ToolDefinition } from "../types/tools.js";

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "bash",
    description:
      "Execute a bash/shell command in the current working directory. Returns stdout, stderr, and exit code combined. Use for running tests, builds, git operations, installing packages, and shell commands. Avoid destructive operations (rm -rf, etc.) without explaining first.",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The shell command to execute",
        },
        timeout: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000, max: 300000)",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "file_read",
    description:
      "Read the contents of a file with line numbers (cat -n format). Can read specific line ranges for large files. ALWAYS use this before editing a file.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute or relative file path",
        },
        startLine: {
          type: "number",
          description: "Start line number (1-indexed, inclusive)",
        },
        endLine: {
          type: "number",
          description: "End line number (1-indexed, inclusive)",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "file_write",
    description:
      "Write content to a file, creating it (and any parent directories) if it doesn't exist. Overwrites the entire file. Prefer file_edit for small changes to existing files.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute or relative file path",
        },
        content: {
          type: "string",
          description: "Complete file content to write",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "file_edit",
    description:
      "Replace an EXACT string in a file with a new string. The oldString must match character-for-character including whitespace and indentation. Use file_read first to see the exact content. Fails if oldString is not found or appears multiple times.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute or relative file path",
        },
        oldString: {
          type: "string",
          description: "The exact string to find and replace (must be unique in the file)",
        },
        newString: {
          type: "string",
          description: "The replacement string",
        },
      },
      required: ["path", "oldString", "newString"],
    },
  },
  {
    name: "glob",
    description:
      "Find files matching a glob pattern. Returns matching file paths sorted by modification time (newest first). Use to discover files before reading or editing them.",
    input_schema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Glob pattern, e.g. '**/*.ts', 'src/**/*.{js,ts}', '*.json'",
        },
        path: {
          type: "string",
          description: "Base directory to search from (default: current working directory)",
        },
      },
      required: ["pattern"],
    },
  },
  {
    name: "grep",
    description:
      "Search file contents for a regex pattern. Returns matching lines with file path and line number. Use to find function definitions, usages, imports, or any text patterns across the codebase.",
    input_schema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Regular expression pattern to search for",
        },
        path: {
          type: "string",
          description: "File or directory to search (default: current working directory)",
        },
        include: {
          type: "string",
          description: "File glob filter, e.g. '*.ts', '*.{js,ts,tsx}'",
        },
        flags: {
          type: "string",
          description: "Flags: -i (case insensitive), -l (files only), -n (line numbers)",
        },
      },
      required: ["pattern"],
    },
  },
  {
    name: "web_fetch",
    description:
      "Fetch the content of any URL and return it as plain text. HTML is stripped to readable text. JSON responses are pretty-printed.\n\n" +
      "CAPABILITIES:\n" +
      "- Works with news sites, blogs, documentation, REST APIs, GitHub raw files, and most static pages.\n" +
      "- Automatically falls back to curl when native fetch times out (handles sites that block Node.js HTTP clients).\n" +
      "- Detects charset (GBK/GB2312 for Chinese sites) and decodes correctly.\n\n" +
      "LIMITATIONS:\n" +
      "- JavaScript-rendered SPAs (React/Vue dashboards) return empty shells — JS is not executed.\n" +
      "- Sites with aggressive bot protection (DataDome, Cloudflare anti-bot) may return 403 even with curl.\n\n" +
      "TIPS:\n" +
      "- The 'referer' param overrides the auto-detected Referer — required for some APIs (e.g. Sina Finance needs 'https://finance.sina.com.cn/').\n" +
      "- If web_fetch returns 403, try passing a different referer or use bash+curl.exe with custom cookies.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to fetch (must start with http:// or https://)",
        },
        maxBytes: {
          type: "number",
          description: "Maximum bytes to read (default: 80000)",
        },
        referer: {
          type: "string",
          description: "Override the Referer header. Required for sites like Sina Finance (use 'https://finance.sina.com.cn/')",
        },
        headers: {
          type: "object",
          description: "Additional HTTP headers as key-value pairs (e.g. {\"X-API-Key\": \"abc\"})",
          additionalProperties: { type: "string" },
        },
      },
      required: ["url"],
    },
  },
  {
    name: "web_search",
    description:
      "Search the web for information and return a list of relevant results (title, URL, snippet). " +
      "Use this when you need to find information but don't have a specific URL — for research, " +
      "technology comparisons, documentation lookup, news, pricing, or any open-ended queries.\n\n" +
      "PROVIDER AUTO-SELECTION:\n" +
      "- Uses the best available provider based on configured API keys (Tavily > Brave > Serper > DuckDuckGo)\n" +
      "- DuckDuckGo works without any API key (free fallback)\n" +
      "- Tavily/Brave/Serper return higher-quality results — configure keys in ~/.seed/settings.json\n\n" +
      "WORKFLOW:\n" +
      "- Search first to discover URLs, then use web_fetch on specific URLs for full content\n" +
      "- For research tasks: search → pick top results → fetch each → synthesise\n" +
      "- Prefer web_search over guessing URLs for documentation sites",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query (natural language or keywords)",
        },
        provider: {
          type: "string",
          enum: ["auto", "tavily", "brave", "serper", "duckduckgo"],
          description:
            "Search provider to use. 'auto' selects based on available API keys. Default: auto",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 8, max: 20)",
        },
      },
      required: ["query"],
    },
  },
];
