import Anthropic from "@anthropic-ai/sdk";
import { sendEmail, isEmailConfigured, esc } from "@/lib/email";
import { sendDiscordMessage } from "@/lib/discord";

// One tiny call per AI engine, returning status and the provider's own
// error text, never keys. Used by the token-guarded health route and the
// daily alert cron.

async function timed(fn) {
  const start = Date.now();
  try {
    return { ...(await fn()), ms: Date.now() - start };
  } catch (e) {
    return { ok: false, error: String(e?.message || e).slice(0, 300), ms: Date.now() - start };
  }
}

async function checkClaude() {
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY not set" };
  return timed(async () => {
    const c = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const r = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 10,
      messages: [{ role: "user", content: "Reply with: ok" }],
    });
    return { ok: true, sample: r?.content?.[0]?.text?.slice(0, 20) };
  });
}

async function checkCloro(engine) {
  if (!process.env.CLORO_API_KEY) return { ok: false, error: "CLORO_API_KEY not set" };
  return timed(async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    try {
      const res = await fetch(`https://api.cloro.dev/v1/monitor/${engine}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CLORO_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "What is the capital of France? One word.",
          country: "US",
          ...(engine === "chatgpt" ? { disableWebSearch: true } : {}),
        }),
        signal: ctrl.signal,
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, body: text.slice(0, 300) };
    } finally {
      clearTimeout(t);
    }
  });
}

export async function checkEngines() {
  const out = { claude: await checkClaude() };
  for (const engine of ["gemini", "chatgpt", "perplexity"]) out[engine] = await checkCloro(engine);
  return out;
}

/**
 * Which failures deserve an alert. Claude backs both AEOrank and the live
 * EasyRep app, so any Claude failure is critical. A single Cloro engine
 * failing is usually Cloro's own outage (Perplexity has been down for
 * weeks); every Cloro engine failing at once points at the account.
 */
export function criticalProblems(r) {
  const problems = [];
  if (!r.claude?.ok) problems.push(`Claude is failing: ${r.claude?.error || r.claude?.body || "unknown error"}`);
  const cloro = ["gemini", "chatgpt", "perplexity"].map((e) => r[e]);
  if (cloro.every((x) => !x?.ok)) {
    problems.push(`Every Cloro engine is failing (likely the Cloro account: credit, key or plan): ${cloro[0]?.error || cloro[0]?.body || "unknown error"}`);
  }
  return problems;
}

/** Email (LEAD_EMAIL_TO) and Discord alert. Returns which channels sent. */
export async function sendEngineAlert(problems, results, { test = false } = {}) {
  const summary = Object.entries(results)
    .map(([k, v]) => `${k}: ${v.ok ? "OK" : "FAILING"}${v.ok ? "" : ` (${(v.error || v.body || "").slice(0, 160)})`}`)
    .join("\n");
  const subject = `${test ? "[TEST] " : ""}AEOrank alert: ${problems.length === 1 ? "an AI engine is" : "AI engines are"} failing`;
  const fix =
    "If Claude says the credit balance is too low: console.anthropic.com → Plans & Billing → add credits. EasyRep's AI features use the same key.";
  const sent = [];
  const to = process.env.LEAD_EMAIL_TO;
  if (to && isEmailConfigured()) {
    const r = await sendEmail({
      to,
      subject,
      text: `${problems.join("\n\n")}\n\nAll engines:\n${summary}\n\n${fix}`,
      html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.55">
        <h2 style="margin:0 0 12px">${esc(subject)}</h2>
        ${problems.map((p) => `<p style="color:#b42318"><strong>${esc(p)}</strong></p>`).join("")}
        <pre style="background:#f4f4f5;padding:12px;border-radius:8px;white-space:pre-wrap">${esc(summary)}</pre>
        <p>${esc(fix)}</p></div>`,
    });
    if (r?.ok !== false) sent.push("email");
  }
  const d = await sendDiscordMessage({ content: `**${subject}**\n${problems.join("\n")}\n${fix}`.slice(0, 1900) });
  if (d.ok) sent.push("discord");
  return sent;
}
