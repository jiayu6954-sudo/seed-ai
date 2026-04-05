import React, { useState, useCallback, useEffect } from "react";
import { Box, Text, Static, useInput, useApp, useStdout } from "ink";
import type { DevAISettings } from "../types/config.js";
import type { AppState } from "../types/ui.js";
import type { PermissionRequest, PermissionDecision } from "../types/permissions.js";
import type { UIMessage } from "../types/agent.js";
import { useAgentLoop } from "./hooks/useAgentLoop.js";
import { MessageList } from "./components/MessageList.js";
import { InputBar } from "./components/InputBar.js";
import { PermissionPrompt } from "./components/PermissionPrompt.js";
import { StatusBar } from "./components/StatusBar.js";
import { Logo } from "./components/Logo.js";
import { ThemeContext, getPalette } from "./theme.js";
import { setMouseScrollCallback } from "./renderer.js";

interface AppProps {
  settings: DevAISettings;
  cwd:      string;
  initialPrompt?: string;
  sessionId?:     string;
}

/**
 * Constrain the streaming message for the dynamic zone.
 *
 * Two passes:
 *  1. Strip completed tool_use blocks (status !== running/pending).
 *     Completed tools accumulate as the conversation grows — each carries a
 *     diff of up to 20 lines, so N tools × 20 lines quickly exceeds termRows,
 *     causing Ink cursor-tracking to drift and produce the "two-layer" flicker.
 *     The full tool history appears correctly in <Static> once isStreaming→false.
 *  2. Truncate the last text block to maxLines (existing behaviour).
 */
function tailMessage(msg: UIMessage, maxLines: number): UIMessage {
  // Pass 1: keep only running/pending tool_use; drop completed ones
  const content: UIMessage["content"] = msg.content.filter((b) => {
    if (b.type === "tool_use") {
      return b.status === "running" || b.status === "pending";
    }
    return true;
  });

  // Pass 2: truncate last text block
  let lastTextIdx = -1;
  for (let i = content.length - 1; i >= 0; i--) {
    if (content[i]!.type === "text") { lastTextIdx = i; break; }
  }
  if (lastTextIdx !== -1) {
    const block = content[lastTextIdx] as { type: "text"; text: string };
    const lines = block.text.split("\n");
    if (lines.length > maxLines) {
      content[lastTextIdx] = { type: "text" as const, text: lines.slice(-maxLines).join("\n") };
    }
  }

  return { ...msg, content };
}

export function App({ settings, cwd, initialPrompt, sessionId }: AppProps): React.ReactElement {
  const { exit }   = useApp();
  const { stdout } = useStdout();

  const [appState, setAppState] = useState<AppState>("idle");
  const [pending,  setPending]  = useState<PermissionRequest | null>(null);

  const palette   = getPalette(settings.ui.theme);
  const termCols  = stdout?.columns ?? 80;
  const termRows  = stdout?.rows    ?? 30;
  // TAIL_LINES: how many lines of streaming text are shown in the dynamic zone.
  // We fill the viewport minus the chrome (StatusBar ~3 + InputBar 1 + hints 1
  // + safety margin 3 = ~8 lines).  This gives a large, comfortable window so
  // the user can read the response as it streams in — the old value of 8 made
  // the view feel like "two lines scrolling".  In primary buffer, dynamic-zone
  // growth causes the terminal to add lines to scrollback naturally (normal
  // terminal behaviour); the jitter (flickering) root cause was the isStreaming
  // bug, which is fixed independently.
  const TAIL_LINES = Math.max(10, termRows - 8);

  const onPermissionRequest = useCallback((req: PermissionRequest) => setPending(req), []);
  const onStateChange = useCallback((state: AppState) => {
    setAppState(state);
    if (state !== "permission_prompt") setPending(null);
  }, []);

  const { messages, statusInfo, currentActivity, streamingTokens, submit, abort, resolvePermission } =
    useAgentLoop({ settings, cwd, initialSessionId: sessionId, onPermissionRequest, onStateChange });

  // Mouse wheel: no-op now (terminal native scroll handles history)
  useEffect(() => {
    setMouseScrollCallback(() => {});
    return () => setMouseScrollCallback(() => {});
  }, []);

  const onDecide = useCallback((d: PermissionDecision) => {
    setPending(null); setAppState("streaming"); resolvePermission(d);
  }, [resolvePermission]);

  useInput((_in, key) => {
    if (key.ctrl && _in === "c") { appState !== "idle" ? abort() : exit(); }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialPrompt) submit(initialPrompt); }, []);

  // ── Static / Dynamic split ───────────────────────────────────────────────
  // Completed messages → <Static>: rendered once, written to terminal scrollback,
  // never redrawn. Only the live streaming message stays in the dynamic zone.
  // This is how Claude Code eliminates stutter: Ink only repaints the bottom strip.
  const completedMessages = messages.filter((m) => !m.isStreaming);
  const streamingMessage  = messages.find((m)  =>  m.isStreaming) ?? null;
  const hasMessages       = messages.length > 0;
  const isInputDisabled   = appState !== "idle";

  return (
    <ThemeContext.Provider value={palette}>
      <Box flexDirection="column">

        {/* ── Completed messages → Static ──────────────────────────────
            Ink writes each item once into the alt-screen buffer and never
            redraws it.  Dynamic zone stays small and fixed-height.        */}
        <Static items={completedMessages}>
          {(msg) => (
            <MessageList
              key={msg.id}
              messages={[msg]}
              hiddenAbove={0}
              showThinking={settings.ui.showThinking}
            />
          )}
        </Static>

        {/* ── Dynamic zone — only this strip repaints every 80ms ───── */}
        <Box flexDirection="column">

          {!hasMessages && (
            <Box paddingX={4} paddingY={1}>
              <Logo />
            </Box>
          )}

          {/* Streaming message — hidden during permission_prompt to keep the
              dynamic zone height stable. A growing/shrinking zone causes Ink's
              cursor-tracking to drift by ≥1 line, producing the "two overlapping
              layers" flicker the user sees when scrolled to the bottom.
              The full message content is preserved in state and will appear in
              <Static> once isStreaming → false after the permission is resolved. */}
          {streamingMessage && appState !== "permission_prompt" && (
            <MessageList
              messages={[tailMessage(streamingMessage, TAIL_LINES)]}
              hiddenAbove={0}
              showThinking={settings.ui.showThinking}
            />
          )}

          {pending && appState === "permission_prompt" && (
            <PermissionPrompt request={pending} onDecide={onDecide} />
          )}

          <StatusBar
            info={statusInfo} state={appState}
            showCost={settings.ui.showCost} showTokens={settings.ui.showTokenCount}
            currentActivity={currentActivity} streamingTokens={streamingTokens}
            termCols={termCols}
          />

          <InputBar onSubmit={submit} disabled={isInputDisabled} maxWidth={termCols - 2} />

          <Box paddingX={3}>
            <Text color={appState === "permission_prompt" ? palette.warning : palette.secondary} dimColor={appState !== "permission_prompt"}>
              {appState === "permission_prompt"
                ? "y · allow once    s · allow session    n · deny"
                : appState === "streaming" || appState === "tool_running"
                ? "Ctrl+C interrupt"
                : appState === "compacting"
                ? "summarising context — please wait…"
                : "Enter send    Shift+Enter newline    Ctrl+W del-word    Ctrl+C exit"}
            </Text>
          </Box>

        </Box>
      </Box>
    </ThemeContext.Provider>
  );
}
