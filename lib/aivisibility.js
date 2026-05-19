// Real AI-visibility check. Asks LIVE models realistic buyer questions and
// reports, honestly, whether the brand actually shows up in the answer.
//
//   • Gemini (2.0 flash + Google Search grounding) — live web answers, free
//     tier from Google AI Studio. Closest to what a buyer sees on a Google
//     AI Overview.
//   • Claude (haiku) — model knowledge, no browsing. Labeled as such.
//
// Nothing here is simulated. If a model doesn't mention the brand, the
// report says so — that gap is the entire sales argument for AEOrank.

import Anthropic from "@anthropic-ai/sdk";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const CALL_TIMEOUT_MS = 14000;

export function isAiVisibilityConfigured() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

// Three realistic, high-intent category questions a buyer would actually ask.
function buildQueries(categoryQuery) {
  const c = (categoryQuery || "this category").trim();
  return [
    `What are the best tools for ${c}? Name a few specific products.`,
    `What do people recommend for ${c}, and why?`,
    `Best ${c} options for a B2B SaaS team in 2026?`,
  ];
}

// Case- and punctuation-insensitive brand detection. Handles "SaaS Offers"
// vs "saasoffers" by also comparing the alphanumeric-only forms.
function mentions(text, brand) {
  if (!text || !brand) return false;
  const t = text.toLowerCase();
  const b = brand.toLowerCase().trim();
  if (b.length < 2) return false;
  if (t.includes(b)) return true;
  const compact = b.replace(/[^a-z0-9]/g, "");
  if (compact.length >= 3 && t.replace(/[^a-z0-9]/g, "").includes(compact)) return true;
  return false;
}

// Gemini with Google Search grounding enabled — answers reflect live web
// results, the same retrieval layer behind Google AI Overviews.
async function geminiAsk(query) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CALL_TIMEOUT_MS);
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "You are a helpful research assistant. Answer concisely in 3-5 sentences. Name specific products or brands where genuinely relevant. Never invent brands.",
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: query }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error("[aivis] gemini", res.status, await res.text().catch(() => ""));
      return null;
    }
    const j = await res.json();
    const parts = j?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p?.text || "").join("").trim();
    return text || null;
  } catch (e) {
    console.error("[aivis] gemini error", e?.message || e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

let _anthropic = null;
function anthropic() {
  if (_anthropic) return _anthropic;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _anthropic = new Anthropic({ apiKey: key });
  return _anthropic;
}

async function claudeAsk(query) {
  const c = anthropic();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "You are Claude, answering a user's question exactly as you normally would in a chat. Answer concisely in 3-5 sentences. Name specific real products or brands where genuinely relevant. Never invent brands or recommend one you are unsure exists.",
      messages: [{ role: "user", content: query }],
    });
    return res?.content?.[0]?.text?.trim() || null;
  } catch (e) {
    console.error("[aivis] claude error", e?.message || e);
    return null;
  }
}

// Runs every (query × model) pair in parallel. Returns:
//   { score, total, hits, rows: [{ query, model, live, answer, mentioned }] }
// score is the % of real answers that named the brand. null when nothing ran.
export async function analyzeBrandVisibility(brand, categoryQuery) {
  const queries = buildQueries(categoryQuery);
  const jobs = [];
  for (const q of queries) {
    if (process.env.GEMINI_API_KEY) {
      jobs.push({ query: q, model: "Gemini", live: true, run: () => geminiAsk(q) });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      jobs.push({ query: q, model: "Claude", live: false, run: () => claudeAsk(q) });
    }
  }
  if (jobs.length === 0) return { score: null, total: 0, hits: 0, rows: [] };

  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  const rows = jobs
    .map((j, i) => {
      const answer = settled[i].status === "fulfilled" ? settled[i].value : null;
      return {
        query: j.query,
        model: j.model,
        live: j.live,
        answer,
        mentioned: answer ? mentions(answer, brand) : null,
      };
    })
    .filter((r) => r.answer);

  const total = rows.length;
  const hits = rows.filter((r) => r.mentioned).length;
  const score = total ? Math.round((hits / total) * 100) : null;
  return { score, total, hits, rows };
}
