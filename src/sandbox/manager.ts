/**
 * I005: Docker Sandbox Manager
 *
 * Runs bash commands inside an ephemeral Docker container to prevent
 * the model from accessing sensitive host files (~/.ssh, .env, etc.).
 *
 * Graceful degradation: if Docker is unavailable, callers fall back to
 * host-side execution (existing behaviour).
 */

import { execa } from "execa";
import { logger } from "../utils/logger.js";

export interface SandboxConfig {
  enabled: boolean;
  level: "strict" | "standard" | "permissive";
  image: string;
  timeoutMs: number;
  maxMemoryMb: number;
  allowNetwork: boolean;
}

export interface SandboxResult {
  stdout: string;
  stderr: string;
  /** Combined stdout+stderr, same as bash tool `all` output */
  all: string;
  exitCode: number;
  timedOut: boolean;
}

const MAX_OUTPUT_BYTES = 100_000;

export class SandboxManager {
  private _available: boolean | null = null;

  constructor(private readonly config: SandboxConfig) {}

  /**
   * Check if Docker daemon is reachable.  Result is cached after the first call.
   */
  async isAvailable(): Promise<boolean> {
    if (this._available !== null) return this._available;
    try {
      await execa("docker", ["info", "--format", "{{.ServerVersion}}"], {
        timeout: 5_000,
        reject: true,
        stdio: "pipe",
      });
      this._available = true;
      logger.debug("sandbox.docker_available");
    } catch {
      this._available = false;
      logger.debug("sandbox.docker_unavailable");
    }
    return this._available;
  }

  /**
   * Execute a shell command inside a fresh, ephemeral Docker container.
   * The container is automatically removed after execution (--rm).
   */
  async run(
    command: string,
    cwd: string,
    signal?: AbortSignal
  ): Promise<SandboxResult> {
    const mountPath = this.toDockerPath(cwd);
    const args = this.buildArgs(command, mountPath);

    logger.debug("sandbox.run", {
      command,
      mountPath,
      level: this.config.level,
      image: this.config.image,
    });

    try {
      const result = await execa("docker", args, {
        timeout: this.config.timeoutMs,
        reject: false,
        all: true,
        maxBuffer: MAX_OUTPUT_BYTES,
        cancelSignal: signal as AbortSignal | undefined,
        stdio: "pipe",
      });

      const combined = result.all ?? (result.stdout + result.stderr);
      const exitCode = result.exitCode ?? 1;

      logger.debug("sandbox.result", { exitCode, outputLen: combined.length });

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        all: combined,
        exitCode,
        timedOut: false,
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes("timed out")) {
        logger.debug("sandbox.timeout", { command });
        return { stdout: "", stderr: "Command timed out", all: "Command timed out", exitCode: 124, timedOut: true };
      }
      throw err;
    }
  }

  /**
   * Build the `docker run` argument list from config and inputs.
   * Exported as a method (not private) so tests can inspect args without
   * needing a live Docker daemon.
   */
  buildArgs(command: string, mountPath: string): string[] {
    const readOnly = this.config.level === "strict" ? ":ro" : "";
    const network = this.config.allowNetwork ? "bridge" : "none";

    const args: string[] = [
      "run", "--rm",
      "-v", `${mountPath}:/workspace${readOnly}`,
      "-w", "/workspace",
      "--network", network,
      "--memory", `${this.config.maxMemoryMb}m`,
      "--cpus", "1",
      "--security-opt", "no-new-privileges",
      // Prevent container from hanging on stdin
      "--interactive=false",
    ];

    args.push(this.config.image, "sh", "-c", command);
    return args;
  }

  /**
   * Convert a Windows absolute path to Docker-compatible POSIX mount path.
   * "D:\\foo\\bar" → "/d/foo/bar"
   * Already-POSIX paths are returned unchanged.
   */
  toDockerPath(p: string): string {
    if (p.startsWith("/")) return p;
    // Windows drive letter: C:\Users\... or C:/Users/...
    const match = /^([a-zA-Z]):[\\\/]?(.*)/.exec(p);
    if (match && match[1] && match[2] !== undefined) {
      const drive = match[1].toLowerCase();
      const rest = match[2].replace(/\\/g, "/");
      return `/${drive}/${rest}`;
    }
    return p.replace(/\\/g, "/");
  }
}
