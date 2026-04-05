/**
 * config subcommand — view and edit Seed AI settings.
 *
 * Usage:
 *   seed config show          — print current settings as JSON
 *   seed config set <key> <value>  — set a settings key
 */

import { Command } from "commander";

export function configCommand(): Command {
  const cmd = new Command("config").description("Manage Seed AI settings");

  cmd
    .command("show")
    .description("Print current settings")
    .action(async () => {
      const { loadSettings, SETTINGS_FILE } = await import("../../config/settings.js");
      const settings = await loadSettings();
      console.log(`Settings file: ${SETTINGS_FILE}\n`);
      console.log(JSON.stringify(settings, null, 2));
    });

  cmd
    .command("set <key> <value>")
    .description("Set a settings value (e.g. seed config set model claude-opus-4-6)")
    .action(async (key: string, value: string) => {
      const { loadSettings, saveSettings } = await import("../../config/settings.js");
      const current = await loadSettings();
      // Simple top-level key override; cast for flexibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (current as any)[key] = value;
      await saveSettings(current);
      console.log(`Updated: ${key} = ${value}`);
    });

  return cmd;
}
