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

// Cloro's plan tiers cap CONCURRENT jobs (a couple on the entry tier) —
// a parallel burst like the report page's engines × queries gets instant
// 429s for everything past the cap, which looked like "ChatGPT and
// Perplexity never answer". This tiny semaphore queues calls instead,
// and the single retry in cloroMonitor absorbs a 429 that slips through.
const MAX_CONCURRENT = 2;
let active = 0;
const waiters = [];
async function acquire() {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise((resolve) => waiters.push(resolve));
  active++;
}
function release() {
  active--;
  const next = waiters.shift();
  if (next) next();
}

async function cloroRequest(engine, prompt, extra) {
  const key = process.env.CLORO_API_KEY;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), CLORO_TIMEOUT_MS);
  try {
    const res = await fetch(`${CLORO_URL}/v1/monitor/${engine}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, country: "US", ...extra }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error(`[cloro] ${engine}`, res.status, await res.text().catch(() => ""));
      return { status: res.status, text: null };
    }
    const j = await res.json();
    return { status: res.status, text: j?.result?.text?.trim() || null };
  } catch (e) {
    console.error(`[cloro] ${engine} error`, e?.message || e);
    return { status: 0, text: null };
  } finally {
    clearTimeout(t);
  }
}

async function cloroMonitor(engine, prompt, extra = {}) {
  if (!isCloroConfigured()) return null;
  await acquire();
  try {
    let r = await cloroRequest(engine, prompt, extra);
    if (r.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      r = await cloroRequest(engine, prompt, extra);
    }
    return r.text;
  } finally {
    release();
  }
}

// Web search deliberately disabled: Cloro's ChatGPT-with-browsing
// pipeline currently fails consistently ("Maximum retries exceeded"
// after ~90-100s, verified repeatedly Sep 2026) while the same call
// with disableWebSearch answers in ~20s. Knowledge-only, so the caller
// labels this engine live:false — same honest framing Claude already
// gets in lib/aivisibility.js. Flip this back once Cloro's web-search
// path recovers.
export function cloroAskChatGPT(prompt) {
  return cloroMonitor("chatgpt", prompt, { disableWebSearch: true });
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
