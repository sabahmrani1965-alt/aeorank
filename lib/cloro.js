// Cloro (cloro.dev) — a unified API that queries ChatGPT/Perplexity/etc
// and returns a plain answer + citations, without needing a direct
// OpenAI/Perplexity API key of our own. Fills the two engines
// lib/aivisibility.js otherwise has no access to for the Prompts
// feature's AI-visibility checks. Same fail-soft convention as every
// other third-party call in this app: missing key or any failure
// returns null, never throws.
const CLORO_URL = "https://api.cloro.dev";
// Cloro's own docs cite a 30-45s average response time — generous on
// purpose, well above lib/aivisibility.js's 14s Gemini/Claude timeout.
const CLORO_TIMEOUT_MS = 45000;

export function isCloroConfigured() {
  return Boolean(process.env.CLORO_API_KEY);
}

async function cloroMonitor(engine, prompt) {
  const key = process.env.CLORO_API_KEY;
  if (!key) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), CLORO_TIMEOUT_MS);
  try {
    const res = await fetch(`${CLORO_URL}/v1/monitor/${engine}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, country: "US" }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error(`[cloro] ${engine}`, res.status, await res.text().catch(() => ""));
      return null;
    }
    const j = await res.json();
    const text = j?.result?.text?.trim();
    return text || null;
  } catch (e) {
    console.error(`[cloro] ${engine} error`, e?.message || e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

export function cloroAskChatGPT(prompt) {
  return cloroMonitor("chatgpt", prompt);
}

export function cloroAskPerplexity(prompt) {
  return cloroMonitor("perplexity", prompt);
}

// Fallback path for Gemini when there's no direct GEMINI_API_KEY (Google
// AI Studio) configured — see lib/aivisibility.js, which prefers the
// direct call (has Google Search grounding explicitly enabled) and only
// falls back to this when that key is absent.
export function cloroAskGemini(prompt) {
  return cloroMonitor("gemini", prompt);
}
