import React from "react";
import { Box, Text } from "ink";
import { createRequire } from "node:module";
import { useTheme } from "../theme.js";

const _require = createRequire(import.meta.url);
const _pkg = _require("../../../package.json") as { version: string };
const VERSION = `v${_pkg.version}`;

/**
 * Sprouting-seed logo — shown on the welcome screen.
 *
 * Design concept: a seed cracking open, embryo glowing gold,
 * a single sprout pushing upward through the split shell.
 *
 *        ╻          ← sprout tip
 *      ╭─┴─╮        ← seed shell cracked open (sprout emerging)
 *     ╱  ◆  ╲       ← seed interior — embryo glows accent (gold)
 *    │  · · │       ← seed texture / cotyledon outline
 *    │       │
 *     ╲     ╱
 *      ╰───╯        ← seed base
 */

// Each entry: [text, colorRole]
//   "accent"    → palette.accent  (gold embryo)
//   "primary"   → palette.secondary (no dim — visible shell lines)
//   "dim"       → palette.secondary + dimColor (background structure)
type Segment = [string, "accent" | "secondary" | "dim"];

// Lines defined as arrays of segments so multi-colour rows work cleanly
const LOGO_ROWS: Segment[][] = [
  [["       ╻       ", "dim"]],
  [["     ╭─┴─╮     ", "secondary"]],
  [["    ╱  ", "secondary"], ["◆", "accent"], ["  ╲    ", "secondary"]],
  [["   │  · · │   ", "dim"]],
  [["   │       │   ", "dim"]],
  [["    ╲     ╱    ", "secondary"]],
  [["     ╰───╯     ", "secondary"]],
];

export function Logo(): React.ReactElement {
  const palette = useTheme();

  return (
    <Box flexDirection="row" alignItems="center">
      {/* Seed glyph */}
      <Box flexDirection="column" marginRight={2}>
        {LOGO_ROWS.map((segments, i) => (
          <Text key={i}>
            {segments.map(([text, role], j) => {
              if (role === "accent")    return <Text key={j} color={palette.accent}>{text}</Text>;
              if (role === "secondary") return <Text key={j} color={palette.secondary}>{text}</Text>;
              return <Text key={j} color={palette.secondary} dimColor>{text}</Text>;
            })}
          </Text>
        ))}
      </Box>

      {/* Name + tagline */}
      <Box flexDirection="column" justifyContent="center">
        <Text color={palette.primary} bold>Seed AI</Text>
        <Text color={palette.secondary} dimColor>grow with every session</Text>
        <Text color={palette.secondary} dimColor>{VERSION}</Text>
      </Box>
    </Box>
  );
}
