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
// The current plan allows ONE job at a time: a probe on 2026-10-15
// (admin engine-health ?probe=concurrency) got one answer and three
// instant 429 CONCURRENCY_LIMIT_EXCEEDED. At 2, every second call failed.
// Raise CLORO_MAX_CONCURRENT only after upgrading the plan and re-probing.
const MAX_CONCURRENT = Math.max(1, Number(process.env.CLORO_MAX_CONCURRENT) || 1);
let active = 0;
const waiters = [];
// Resolves true once a slot is held, false if the deadline passes first,
// so a call that could never finish in time gives up instead of queueing.
function acquire(deadline) {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const w = () => {
      clearTimeout(timer);
      active++;
      resolve(true);
    };
    const timer = deadline
      ? setTimeout(() => {
          const i = waiters.indexOf(w);
          if (i >= 0) waiters.splice(i, 1);
          resolve(false);
        }, Math.max(0, deadline - Date.now()))
      : null;
    waiters.push(w);
  });
}
function release() {
  active--;
  const next = waiters.shift();
  if (next) next();
}

// An engine Cloro reports as unavailable (Perplexity returned
// MODEL_UNAVAILABLE for weeks in Sep-Oct 2026) is skipped for a while
// instead of holding one of the scarce slots on every check.
const DOWN_MS = 30 * 60 * 1000;
const downUntil = {};
export function isCloroEngineDown(engine) {
  return (downUntil[engine] || 0) > Date.now();
}

// Below this much remaining time a Cloro call is not worth starting.
const MIN_USEFUL_MS = 8000;

async function cloroRequest(engine, prompt, extra, deadline) {
  const key = process.env.CLORO_API_KEY;
  const ctrl = new AbortController();
  const budget = deadline ? Math.min(CLORO_TIMEOUT_MS, deadline - Date.now()) : CLORO_TIMEOUT_MS;
  const t = setTimeout(() => ctrl.abort(), budget);
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
      const body = await res.text().catch(() => "");
      console.error(`[cloro] ${engine}`, res.status, body.slice(0, 300));
      if (/MODEL_UNAVAILABLE|not available|unavailable/i.test(body)) downUntil[engine] = Date.now() + DOWN_MS;
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

// opts.deadline (epoch ms): the caller's own time budget. The call is
// skipped, abandoned in the queue, or aborted mid-flight rather than
// outliving the serverless function that is waiting for it.
async function cloroMonitor(engine, prompt, extra = {}, { deadline } = {}) {
  if (!isCloroConfigured() || isCloroEngineDown(engine)) return null;
  if (deadline && deadline - Date.now() < MIN_USEFUL_MS) return null;
  if (!(await acquire(deadline ? deadline - MIN_USEFUL_MS : undefined))) return null;
  try {
    let r = await cloroRequest(engine, prompt, extra, deadline);
    if (r.status === 429 && (!deadline || deadline - Date.now() > MIN_USEFUL_MS + 2500)) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      r = await cloroRequest(engine, prompt, extra, deadline);
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
export function cloroAskChatGPT(prompt, opts) {
  return cloroMonitor("chatgpt", prompt, { disableWebSearch: true }, opts);
}

export function cloroAskPerplexity(prompt, opts) {
  return cloroMonitor("perplexity", prompt, {}, opts);
}

// Fallback path for Gemini when there's no direct GEMINI_API_KEY (Google
// AI Studio) configured — see lib/aivisibility.js, which prefers the
// direct call (has Google Search grounding explicitly enabled) and only
// falls back to this when that key is absent.
export function cloroAskGemini(prompt, opts) {
  return cloroMonitor("gemini", prompt, {}, opts);
}
