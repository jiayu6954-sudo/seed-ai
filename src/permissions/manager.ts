import type { DevAISettings } from "../types/config.js";
import type {
  PermissionRequest,
  PermissionDecision,
  RiskLevel,
} from "../types/permissions.js";
import type { ToolInput } from "../types/tools.js";
import { classifyRisk, describeAction } from "./classifier.js";
import { logger } from "../utils/logger.js";

export type UserPromptFn = (
  req: PermissionRequest
) => Promise<PermissionDecision>;

export class PermissionManager {
  // Cache of (toolName + JSON input hash) → "allow-session" decisions
  private sessionAllowances = new Set<string>();

  constructor(
    private settings: DevAISettings,
    private promptUser: UserPromptFn,
    private sandboxEnabled = false
  ) {}

  async request(toolName: string, input: ToolInput | Record<string, unknown>): Promise<PermissionDecision> {
    const riskLevel: RiskLevel = classifyRisk(toolName, input);
    const description = describeAction(toolName, input);

    const req: PermissionRequest = { toolName, input, riskLevel, description };

    logger.debug("permission.request", { toolName, riskLevel, description });

    // Phase 1: Static deny
    if (this.isStaticDenied(req)) {
      logger.debug("permission.static_deny", { toolName });
      return "deny";
    }

    // Phase 2: Session-level cache (user previously said "allow this session")
    const cacheKey = this.cacheKey(req);
    if (this.sessionAllowances.has(cacheKey)) {
      logger.debug("permission.session_cache_hit", { toolName });
      return "allow";
    }

    // Phase 3: Static auto-allow
    if (this.isAutoAllowed(req)) {
      logger.debug("permission.auto_allow", { toolName });
      return "allow";
    }

    // Phase 4: Always prompt for dangerous operations, even if "auto" is set
    if (riskLevel === "dangerous" && this.getConfiguredLevel(toolName) !== "deny") {
      logger.debug("permission.force_prompt_dangerous", { toolName });
      const decision = await this.promptUser(req);
      this.cacheSessionDecision(cacheKey, decision);
      return decision === "allow-session" ? "allow" : decision;
    }

    // Phase 5: Ask user
    const decision = await this.promptUser(req);
    this.cacheSessionDecision(cacheKey, decision);
    return decision === "allow-session" ? "allow" : decision;
  }

  private isStaticDenied(req: PermissionRequest): boolean {
    const level = this.getConfiguredLevel(req.toolName);
    if (level === "deny") return true;

    // Check custom rules (later rules override earlier)
    for (const rule of this.settings.customRules) {
      if (rule.tool === req.toolName || rule.tool === "*") {
        if (rule.level === "deny") return true;
      }
    }

    return false;
  }

  private isAutoAllowed(req: PermissionRequest): boolean {
    // Custom rules take precedence
    for (const rule of [...this.settings.customRules].reverse()) {
      if (rule.tool === req.toolName || rule.tool === "*") {
        if (rule.level === "auto") return true;
        if (rule.level === "ask") return false;
      }
    }

    const level = this.getConfiguredLevel(req.toolName);

    // I005 Sandbox: when Docker sandbox is active, safe bash commands are truly
    // safe (container cannot access ~/.ssh, .env, etc.) → auto-allow them.
    // Moderate bash still asks; dangerous bash is always force-prompted (Phase 4).
    if (this.sandboxEnabled && req.toolName === "bash" && req.riskLevel === "safe") {
      return true;
    }

    return level === "auto" && req.riskLevel !== "dangerous";
  }

  private getConfiguredLevel(toolName: string): "auto" | "ask" | "deny" {
    return (this.settings.defaultPermissions as Record<string, "auto" | "ask" | "deny">)[toolName] ?? "ask";
  }

  private cacheKey(req: PermissionRequest): string {
    return `${req.toolName}:${JSON.stringify(req.input)}`;
  }

  private cacheSessionDecision(key: string, decision: PermissionDecision): void {
    if (decision === "allow-session") {
      this.sessionAllowances.add(key);
    }
  }

  // Convenience: create a manager that auto-approves everything (for tests/pipe mode)
  static createPermissive(settings: DevAISettings, sandboxEnabled = false): PermissionManager {
    return new PermissionManager(settings, async () => "allow", sandboxEnabled);
  }

  // Convenience: create a manager that denies everything (read-only mode)
  static createReadOnly(settings: DevAISettings): PermissionManager {
    const readOnly = {
      ...settings,
      defaultPermissions: {
        ...settings.defaultPermissions,
        bash: "deny" as const,
        file_write: "deny" as const,
        file_edit: "deny" as const,
        web_fetch: "ask" as const,
      },
    };
    return new PermissionManager(readOnly, async () => "allow");
  }
}
