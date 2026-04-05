/**
 * I010: Natural-language token budget parser
 *
 * Parses phrases like "+500k", "spend 2M tokens", "budget 1.5m" directly from
 * user input and converts them to a numeric token limit that overrides the
 * session hardLimit. Mirrors Claude Code's natural-language budget handling
 * (src/utils/tokenUtils.ts) but extended with more patterns.
 *
 * Supported forms:
 *   "+500k"           → 500_000
 *   "+2m"             → 2_000_000
 *   "spend 1.5M"      → 1_500_000
 *   "budget 200k"     → 200_000
 *   "use up to 300k"  → 300_000
 *   "limit 1M tokens" → 1_000_000
 *
 * Returns null if no budget phrase is detected.
 */

// ── Constants ──────────────────────────────────────────────────────────────

const MIN_BUDGET = 1_000;          // ignore suspiciously small values
const MAX_BUDGET = 10_000_000;     // 10M hard ceiling

// ── Core parser ───────────────────────────────────────────────────────────

/**
 * Attempt to extract a token count from a natural-language string.
 * Returns the parsed integer or null if no recognisable pattern found.
 */
export function parseTokenBudget(input: string): number | null {
  if (!input || input.trim().length === 0) return null;

  // Pattern: optional verb prefix + number + optional multiplier suffix
  // Examples: "+500k", "spend 2M tokens", "budget 1.5m", "use 300K"
  const pattern =
    /(?:^|\s)(?:spend|budget|limit|use(?:\s+up\s+to)?|add|give(?:\s+me)?|allow)?\s*\+?\s*(\d+(?:\.\d+)?)\s*([kmb](?:illion|illion|))?(?:\s*(?:tokens?|tok|t))?\b/gi;

  let best: number | null = null;

  for (const match of input.matchAll(pattern)) {
    const rawNum = match[1];
    const suffix = (match[2] ?? "").toLowerCase().charAt(0); // k / m / b / ""

    if (!rawNum) continue;

    const base = parseFloat(rawNum);
    if (isNaN(base)) continue;

    let value: number;
    switch (suffix) {
      case "k": value = Math.round(base * 1_000);       break;
      case "m": value = Math.round(base * 1_000_000);   break;
      case "b": value = Math.round(base * 1_000_000_000); break;
      default:
        // bare number — only accept if ≥ 1000 (raw token count, not char count)
        value = Math.round(base);
        if (value < 1_000) continue;
        break;
    }

    if (value < MIN_BUDGET || value > MAX_BUDGET) continue;

    // Keep the largest value found in the message
    if (best === null || value > best) best = value;
  }

  return best;
}

/**
 * Strip the budget phrase from the user input so it isn't sent to the LLM.
 * Only strips when we successfully parsed a budget; otherwise returns input unchanged.
 */
export function stripTokenBudgetPhrase(input: string): string {
  // Remove patterns like "+500k tokens", "spend 2M", "budget 1.5m tokens"
  return input
    .replace(
      /\b(?:spend|budget|limit|use(?:\s+up\s+to)?|add|give(?:\s+me)?|allow)\s+\+?\s*\d+(?:\.\d+)?\s*[kmb](?:illion)?\s*(?:tokens?)?\b/gi,
      ""
    )
    .replace(/\s*\+\s*\d+(?:\.\d+)?\s*[kmb](?:illion)?\s*(?:tokens?)?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
