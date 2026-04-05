/**
 * UI state types shared across app, hooks, and components.
 */

export type AppState =
  | "idle"
  | "streaming"
  | "tool_running"
  | "permission_prompt"
  | "error"
  | "compacting";
