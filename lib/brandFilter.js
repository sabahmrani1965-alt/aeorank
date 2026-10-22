// Names the competitor extraction picks up that are not competitors: the AI
// engines and platforms the question is asked on or about. Counting them made
// "ChatGPT" the #1 brand in share of voice for a brand asking "what tracks
// visibility in ChatGPT?" (design review, 2026-10-21).
const PLATFORMS = new Set(
  [
    "chatgpt", "openai", "gpt", "gpt-4", "gpt-5", "claude", "anthropic", "gemini", "google gemini", "bard",
    "perplexity", "perplexity ai", "copilot", "microsoft copilot", "bing", "bing copilot", "grok", "meta ai",
    "google", "google ai overviews", "ai overviews", "google search", "reddit", "quora", "youtube", "linkedin",
  ]
);

export const isPlatformName = (name) => PLATFORMS.has(String(name || "").trim().toLowerCase());

const core = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Competitor names only: no platforms, and not the brand itself. */
export function competitorsOnly(names, brand) {
  const own = core(brand);
  return (names || []).filter((n) => !isPlatformName(n) && (!own || core(n) !== own));
}
