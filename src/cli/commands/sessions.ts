/**
 * sessions subcommand — list past sessions.
 *
 * Usage:
 *   seed sessions list   — show recent sessions with timestamps
 */

import { Command } from "commander";

export function sessionsCommand(): Command {
  const cmd = new Command("sessions").description("Manage Seed AI sessions");

  cmd
    .command("list")
    .description("List recent sessions")
    .action(async () => {
      const fs   = await import("node:fs/promises");
      const path = await import("node:path");
      const { SESSIONS_DIR } = await import("../../config/settings.js");

      let entries: string[] = [];
      try {
        entries = await fs.readdir(SESSIONS_DIR);
      } catch {
        console.log("No sessions found.");
        return;
      }

      if (entries.length === 0) {
        console.log("No sessions found.");
        return;
      }

      // Sort by name (session IDs are timestamp-prefixed)
      entries.sort((a, b) => b.localeCompare(a));
      const recent = entries.slice(0, 20);

      console.log(`Sessions (${entries.length} total, showing last ${recent.length}):\n`);
      for (const entry of recent) {
        const file = path.join(SESSIONS_DIR, entry);
        let size = "";
        try {
          const stat = await fs.stat(file);
          size = `${Math.round(stat.size / 1024)}KB`;
        } catch { /* ignore */ }
        console.log(`  ${entry}  ${size}`);
      }
    });

  return cmd;
}
