import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { SESSIONS_DIR } from "../config/settings.js";
import type { ConversationMessage, ModelId, TokenUsage } from "../types/agent.js";
import { logger } from "../utils/logger.js";

export interface Session {
  id: string;
  cwd: string;
  createdAt: string;
  updatedAt: string;
  model: ModelId;
  messages: ConversationMessage[];
  totalUsage: TokenUsage;
  title?: string; // Auto-generated from first user message
}

export function createSession(cwd: string, model: ModelId): Session {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    cwd,
    createdAt: now,
    updatedAt: now,
    model,
    messages: [],
    totalUsage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      estimatedCostUsd: 0,
    },
  };
}

export async function saveSession(session: Session): Promise<void> {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    const filePath = path.join(SESSIONS_DIR, `${session.id}.json`);
    const updated = { ...session, updatedAt: new Date().toISOString() };
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), "utf-8");
    logger.debug("session.saved", { id: session.id });
  } catch (err) {
    logger.error("session.save.error", err);
  }
}

export async function loadSession(id: string): Promise<Session | null> {
  try {
    const filePath = path.join(SESSIONS_DIR, `${id}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function listSessions(): Promise<Session[]> {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    const files = await fs.readdir(SESSIONS_DIR);
    const sessions: Session[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(SESSIONS_DIR, file), "utf-8");
        sessions.push(JSON.parse(raw) as Session);
      } catch {
        // Corrupt session file — skip
      }
    }

    // Sort by most recent first
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    await fs.unlink(path.join(SESSIONS_DIR, `${id}.json`));
    logger.info("session.deleted", { id });
  } catch {
    // Already gone
  }
}

export function deriveTitle(firstUserMessage: string): string {
  return firstUserMessage.slice(0, 60).replace(/\n/g, " ").trim();
}
