// Real AI-visibility check. Asks LIVE models realistic buyer questions and
// reports, honestly, whether the brand actually shows up in the answer.
//
//   • Gemini (2.0 flash + Google Search grounding) — live web answers, free
//     tier from Google AI Studio. Closest to what a buyer sees on a Google
//     AI Overview.
//   • Claude (haiku) — model knowledge, no browsing. Labeled as such.
//   • ChatGPT / Perplexity (via Cloro, lib/cloro.js) — we have no direct
//     OpenAI/Perplexity API key, so these route through Cloro's unified
//     monitoring API instead of being unavailable entirely.
//
// Nothing here is simulated. If a model doesn't mention the brand, the
// report says so — that gap is the entire sales argument for AEOrank.

import Anthropic from "@anthropic-ai/sdk";
import { isCloroConfigured, cloroAskChatGPT, cloroAskPerplexity, cloroAskGemini } from "./cloro";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const CALL_TIMEOUT_MS = 14000;

export function isAiVisibilityConfigured() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.CLORO_API_KEY);
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

// Given the real answers already collected above, ask Claude to pull out
// the specific competitor names that appear in them — read-only text
// extraction, nothing invented and nothing posted anywhere. This turns
// "you weren't mentioned" into "here's who AI named instead", which is the
// same competitor-visibility signal Reddit-mention trackers surface, but
// sourced from live model answers we already made rather than a second
// scrape.
async function extractCompetitors(rows, brand) {
  const c = anthropic();
  if (!c) return [];
  const text = rows.map((r) => r.answer).filter(Boolean).join("\n---\n");
  if (!text) return [];
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: `You extract competitor brand/product names from AI-generated answers for a brand-visibility audit.

Rules — return ONLY a JSON array of strings, nothing else:
- List distinct real product or company names that literally appear in the text below, excluding "${brand}" itself.
- Never invent or infer a name that isn't in the text.
- No generic terms ("a good tool", "several platforms").
- No duplicates. Max 8 items, ordered by how often each appears.`,
      messages: [{ role: "user", content: text }],
    });
    const raw = res?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    let arr;
    try { arr = JSON.parse(match[0]); } catch { return []; }
    if (!Array.isArray(arr)) return [];
    return arr
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length >= 2 && s.length <= 40 && s.toLowerCase() !== brand.toLowerCase())
      .filter((s, i, a) => a.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i)
      .slice(0, 8);
  } catch (e) {
    console.error("[aivis] competitor extraction failed:", e?.message || e);
    return [];
  }
}

// Like extractCompetitors, but for exactly ONE answer and explicitly
// INCLUDING the target brand if present — extractCompetitors deliberately
// excludes it and runs across many combined rows, neither of which fits
// what checkPrompt needs (a single answer's full brand list, target
// brand included, so its position within that list can be computed).
async function extractBrandsFromAnswer(answer, brand) {
  const c = anthropic();
  if (!c || !answer) return [];
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system: `You extract every real brand/product/company name mentioned in one AI-generated answer, for a brand-visibility check.

Rules — return ONLY a JSON array of strings, nothing else:
- List every distinct real product or company name that literally appears in the text, including "${brand}" itself if it's present.
- Never invent or infer a name that isn't in the text.
- No generic terms ("a good tool", "several platforms").
- No duplicates. Max 10 items.`,
      messages: [{ role: "user", content: answer }],
    });
    const raw = res?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    let arr;
    try { arr = JSON.parse(match[0]); } catch { return []; }
    if (!Array.isArray(arr)) return [];
    return arr
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length >= 2 && s.length <= 40)
      .filter((s, i, a) => a.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i)
      .slice(0, 10);
  } catch (e) {
    console.error("[aivis] brand extraction failed:", e?.message || e);
    return [];
  }
}

// Runs brand extraction + position computation for ONE already-collected
// answer. Split out of checkPrompt so every configured engine's answer
// gets analyzed on its own terms — an engine that doesn't mention the
// brand shouldn't be masked by a different engine that does.
async function analyzeAnswer(answer, brand) {
  const extracted = await extractBrandsFromAnswer(answer, brand);
  const lowerAnswer = answer.toLowerCase();
  const positioned = extracted
    .map((name) => ({ name, idx: lowerAnswer.indexOf(name.toLowerCase()) }))
    .filter((b) => b.idx !== -1)
    .sort((a, b) => a.idx - b.idx);

  const brandIdx = positioned.findIndex((b) => b.name.toLowerCase() === brand.toLowerCase());
  // Falls back to the plain substring check if extraction missed an exact
  // mention — "mentioned" should never disagree with a literal match.
  const mentioned = brandIdx !== -1 || mentions(answer, brand);
  const position = brandIdx !== -1 ? brandIdx + 1 : null;

  return { mentioned, position, brands: positioned.map((b) => b.name) };
}

// Of all the engines that answered, which one represents the brand's
// prompts.last_* "current state" cache (a single-row denormalized
// summary — see supabase/schema.sql). Prefers Gemini (closest to what a
// real buyer sees, via live Google Search grounding), then any other
// live/web-grounded engine, then whatever's left.
export function pickPrimaryResult(results) {
  return results.find((r) => r.model === "Gemini") || results.find((r) => r.live) || results[0];
}

// Checks ONE user-authored prompt against EVERY configured engine, and
// returns one fully-analyzed result per engine that actually answered —
// not a single "winning" result. A prompt ChatGPT mentions but Gemini
// doesn't is exactly the kind of per-engine gap this feature exists to
// surface (see app/api/prompts/[id]/check/route.js and
// app/api/cron/check-prompts/route.js for how these get persisted).
export async function checkPrompt(promptText, brand) {
  const jobs = [];
  // Direct Gemini (Google Search grounding) is preferred when its own key
  // is set; Cloro's /monitor/gemini is the fallback when it isn't — see
  // lib/cloro.js. Never both, to avoid two rows both labeled "Gemini".
  if (process.env.GEMINI_API_KEY) {
    jobs.push({ model: "Gemini", live: true, run: () => geminiAsk(promptText) });
  } else if (isCloroConfigured()) {
    jobs.push({ model: "Gemini", live: true, run: () => cloroAskGemini(promptText) });
  }
  if (process.env.ANTHROPIC_API_KEY) jobs.push({ model: "Claude", live: false, run: () => claudeAsk(promptText) });
  if (isCloroConfigured()) {
    // live:false — cloroAskChatGPT currently runs with web search
    // disabled (see lib/cloro.js for why), so like Claude it answers
    // from model knowledge only and must not win the "live" primary slot.
    jobs.push({ model: "ChatGPT", live: false, run: () => cloroAskChatGPT(promptText) });
    jobs.push({ model: "Perplexity", live: true, run: () => cloroAskPerplexity(promptText) });
  }
  if (jobs.length === 0) return null;

  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  const answered = jobs
    .map((j, i) => ({ model: j.model, live: j.live, answer: settled[i].status === "fulfilled" ? settled[i].value : null }))
    .filter((r) => r.answer);
  if (answered.length === 0) return null;

  return Promise.all(
    answered.map(async (r) => ({
      model: r.model,
      live: r.live,
      answer: r.answer,
      ...(await analyzeAnswer(r.answer, brand)),
    }))
  );
}

// Shared write path for both the manual "Check now" button and the cron
// sweep — one prompts.last_* update (the primary result) plus one
// prompt_checks history row PER ENGINE that answered. prompt_checks has
// no uniqueness constraint on (prompt_id, created_at), so multiple rows
// per check event were already schema-safe before this feature existed.
export async function persistCheckResults(admin, { promptId, userId, results, checkedAt }) {
  const primary = pickPrimaryResult(results);

  const { error: updateError } = await admin
    .from("prompts")
    .update({
      last_checked_at: checkedAt,
      last_mentioned: primary.mentioned,
      last_position: primary.position,
      last_brands: primary.brands,
      last_answer: primary.answer,
      last_model: primary.model,
    })
    .eq("id", promptId);
  if (updateError) console.error("[aivis] prompts update failed:", updateError.message);

  const rows = results.map((r) => ({
    prompt_id: promptId,
    user_id: userId,
    mentioned: r.mentioned,
    position: r.position,
    brands: r.brands,
    answer: r.answer,
    model: r.model,
    created_at: checkedAt,
  }));
  const { error: historyError } = await admin.from("prompt_checks").insert(rows);
  if (historyError) console.error("[aivis] prompt_checks insert failed:", historyError.message);

  return primary;
}

// Runs every (query × model) pair in parallel. Returns:
//   { score, total, hits, rows: [{ query, model, live, answer, mentioned }], competitors }
// score is the % of real answers that named the brand. null when nothing ran.
export async function analyzeBrandVisibility(brand, categoryQuery) {
  const queries = buildQueries(categoryQuery);
  const jobs = [];
  for (const q of queries) {
    // Same engine roster as checkPrompt above: direct Gemini preferred,
    // Cloro's Gemini as fallback, plus ChatGPT (knowledge-only while
    // Cloro's web-search path is down — see lib/cloro.js) and Perplexity.
    if (process.env.GEMINI_API_KEY) {
      jobs.push({ query: q, model: "Gemini", live: true, run: () => geminiAsk(q) });
    } else if (isCloroConfigured()) {
      jobs.push({ query: q, model: "Gemini", live: true, run: () => cloroAskGemini(q) });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      jobs.push({ query: q, model: "Claude", live: false, run: () => claudeAsk(q) });
    }
    if (isCloroConfigured()) {
      jobs.push({ query: q, model: "ChatGPT", live: false, run: () => cloroAskChatGPT(q) });
      jobs.push({ query: q, model: "Perplexity", live: true, run: () => cloroAskPerplexity(q) });
    }
  }
  if (jobs.length === 0) return { score: null, total: 0, hits: 0, rows: [], competitors: [] };

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
  const competitors = await extractCompetitors(rows, brand);
  return { score, total, hits, rows, competitors };
}
