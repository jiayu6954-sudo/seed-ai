/**
 * Innovation 16 (I016): Storage Guard
 *
 * Prevents the ~/.seed/ data directory from growing unbounded.
 * Runs non-blocking on every startup; errors are swallowed (non-fatal).
 *
 * Strategy:
 *   1. Walk DATA_DIR and compute total size
 *   2. If total > MAX_BYTES, delete oldest session files until under TRIM_TARGET
 *   3. Log action to debug log (silent to user)
 *
 * Claude Code has no equivalent — long-running CC installations accumulate
 * session transcripts with no automatic pruning mechanism.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, SESSIONS_DIR } from "../config/settings.js";
import { logger } from "../utils/logger.js";

/** 2 GB hard limit for entire data directory */
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
/** Trim down to 1.5 GB when limit is exceeded */
const TRIM_TARGET = 1.5 * 1024 * 1024 * 1024;
/** Warn in debug log when approaching limit */
const WARN_BYTES = 1.5 * 1024 * 1024 * 1024;

interface FileEntry {
  path: string;
  size: number;
  mtimeMs: number;
}

async function getDirSize(dir: string): Promise<number> {
  let total = 0;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          total += await getDirSize(full);
        } else {
          const st = await fs.stat(full).catch(() => null);
          if (st) total += st.size;
        }
      })
    );
  } catch { /* dir may not exist yet */ }
  return total;
}

async function getSessionFiles(): Promise<FileEntry[]> {
  const files: FileEntry[] = [];
  try {
    const names = await fs.readdir(SESSIONS_DIR);
    await Promise.all(
      names.map(async (name) => {
        const p = path.join(SESSIONS_DIR, name);
        const st = await fs.stat(p).catch(() => null);
        if (st?.isFile()) {
          files.push({ path: p, size: st.size, mtimeMs: st.mtimeMs });
        }
      })
    );
  } catch { /* sessions dir may not exist */ }
  return files;
}

export async function runStorageGuard(): Promise<void> {
  try {
    const total = await getDirSize(DATA_DIR);

    if (total >= WARN_BYTES) {
      logger.debug(`[I016] Storage warning: ${Math.round(total / 1e6)}MB used in ${DATA_DIR}`);
    }

    if (total < MAX_BYTES) return;

    logger.debug(`[I016] Storage limit exceeded (${Math.round(total / 1e6)}MB). Pruning sessions…`);

    const sessions = await getSessionFiles();
    // Oldest first
    sessions.sort((a, b) => a.mtimeMs - b.mtimeMs);

    let freed = 0;
    const needed = total - TRIM_TARGET;

    for (const file of sessions) {
      if (freed >= needed) break;
      await fs.unlink(file.path).catch(() => null);
      freed += file.size;
      logger.debug(`[I016] Deleted session: ${path.basename(file.path)} (${Math.round(file.size / 1024)}KB)`);
    }

    logger.debug(`[I016] Freed ${Math.round(freed / 1e6)}MB`);
  } catch {
    // Non-fatal — never surface storage guard errors to the user
  }
}
