import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { SettingsSchema, type SeedSettings } from "./schema.js";

/**
 * SEED_DATA_DIR — relocate all runtime data off the system drive.
 *
 * Priority:
 *   1. SEED_DATA_DIR environment variable  (e.g. F:\seed-data)
 *   2. ~/.seed  (default)
 *
 * Set once at module load; all path constants derived from it.
 */
export const DATA_DIR: string = (() => {
  const env = process.env["SEED_DATA_DIR"];
  if (env && env.trim()) return path.resolve(env.trim());
  return path.join(os.homedir(), ".seed");
})();

// Keep CONFIG_DIR as alias so existing imports don't break
export const CONFIG_DIR = DATA_DIR;
export const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
export const SESSIONS_DIR = path.join(DATA_DIR, "sessions");
export const MEMORY_DIR = path.join(DATA_DIR, "memory");
export const LOG_FILE = path.join(DATA_DIR, "debug.log");

export async function loadSettings(): Promise<SeedSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return SettingsSchema.parse(parsed);
  } catch {
    // File doesn't exist or is malformed — return all defaults
    return SettingsSchema.parse({});
  }
}

export async function saveSettings(
  partial: Partial<SeedSettings>
): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  const current = await loadSettings();
  const merged = deepMerge(current, partial);
  const validated = SettingsSchema.parse(merged);
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(validated, null, 2), "utf-8");
}

export async function ensureConfigDir(): Promise<void> {
  await Promise.all([
    fs.mkdir(DATA_DIR, { recursive: true }),
    fs.mkdir(SESSIONS_DIR, { recursive: true }),
    fs.mkdir(MEMORY_DIR, { recursive: true }),
  ]);
}

// Apply CLI option overrides on top of file settings
export function applyCliOverrides(
  settings: SeedSettings,
  opts: {
    model?: string;
    maxTokens?: number;
    allowAll?: boolean;
    denyAll?: boolean;
    apiKey?: string;
  }
): SeedSettings {
  const result = { ...settings };

  if (opts.model) {
    result.model = opts.model as SeedSettings["model"];
  }
  if (opts.maxTokens) {
    result.maxTokens = opts.maxTokens;
  }
  if (opts.apiKey) {
    result.apiKey = opts.apiKey;
  }
  if (opts.allowAll) {
    result.defaultPermissions = {
      bash: "auto",
      file_write: "auto",
      file_edit: "auto",
      file_read: "auto",
      glob: "auto",
      grep: "auto",
      web_fetch: "auto",
      web_search: "auto",
      git_commit: "auto",
      spawn_research: "auto",
    };
  }
  if (opts.denyAll) {
    result.defaultPermissions = {
      bash: "deny",
      file_write: "deny",
      file_edit: "deny",
      file_read: "auto",
      glob: "auto",
      grep: "auto",
      web_fetch: "deny",
      web_search: "auto",
      git_commit: "deny",
      spawn_research: "auto",
    };
  }

  return result;
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== undefined &&
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      typeof tgtVal === "object" &&
      tgtVal !== null &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal as object, srcVal as object) as T[typeof key];
    } else if (srcVal !== undefined) {
      result[key] = srcVal as T[typeof key];
    }
  }
  return result;
}
