// ChatGPT answers straight from OpenAI's API (2026-10-21). Cloro's ChatGPT
// route ran out of credits on 2026-10-19 and AEOrank went three days
// without ChatGPT data; OpenAI's own API costs about a cent per answer and
// has no one-job-at-a-time cap. Every "-chat-latest" model (the ones behind
// the ChatGPT app) was deprecated by 2026-10-21, so the default is a current
// API model, gpt-5.4-mini: cheap enough for every daily check. Set
// OPENAI_CHATGPT_MODEL (e.g. gpt-5.5) to use another. No web search, same as the Cloro call it
// replaces (disableWebSearch), so callers keep labelling it live:false.
// Fail-soft like the other engines: any problem returns null.
const MODEL = process.env.OPENAI_CHATGPT_MODEL || "gpt-5.4-mini";
const TIMEOUT_MS = 45000;

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function openaiAskChatGPT(prompt, { deadline } = {}) {
  if (!isOpenAIConfigured()) return null;
  const budget = deadline ? Math.min(TIMEOUT_MS, deadline - Date.now()) : TIMEOUT_MS;
  if (budget < 5000) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), budget);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }] }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error("[openai] chatgpt", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return null;
    }
    const j = await res.json();
    return j?.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("[openai] chatgpt error", e?.message || e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** For the daily engine check: same request, with the error kept. */
export async function checkOpenAI() {
  if (!isOpenAIConfigured()) return null;
  const started = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: "What is the capital of France? One word." }] }),
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, via: `openai ${MODEL}`, body: res.ok ? undefined : body.slice(0, 300), ms: Date.now() - started };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), ms: Date.now() - started };
  }
}
