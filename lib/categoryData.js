// Public category data: which brands AI assistants name when a buyer asks
// for options in a category. A daily cron (app/api/cron/category-data)
// asks AEOrank's own fixed questions, never customer prompts, and stores
// the answers in the private Storage bucket below. The pages under
// /ai-recommendations read only the summaries the cron writes.

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { claudeAsk } from "@/lib/aivisibility";
import { cloroAskChatGPT, cloroAskGemini, isCloroConfigured } from "@/lib/cloro";
import { fetchThread } from "@/lib/reddit";

export const BUCKET = "category-data";
const WINDOW_DAYS = 30;

// Fixed questions. Changing one resets what the trend can claim, so add a
// category rather than rewording an existing one.
export const DATA_CATEGORIES = [
  {
    slug: "crm-software",
    name: "CRM software",
    questions: [
      "What is the best CRM software for a small business? Name specific products.",
      "Which CRM would you recommend for a startup sales team in 2026, and why?",
      "Compare the leading CRM platforms. Which would you pick?",
    ],
  },
  {
    slug: "project-management-software",
    name: "project management software",
    questions: [
      "What is the best project management software for a small team? Name specific products.",
      "Which project management tool would you recommend for a growing company in 2026, and why?",
      "Compare the leading project management tools. Which would you pick?",
    ],
  },
  {
    slug: "email-marketing-software",
    name: "email marketing software",
    questions: [
      "What is the best email marketing software for a small business? Name specific products.",
      "Which email marketing platform would you recommend for an online store in 2026, and why?",
      "Compare the leading email marketing tools. Which would you pick?",
    ],
  },
  {
    slug: "help-desk-software",
    name: "help desk software",
    questions: [
      "What is the best help desk software for a small support team? Name specific products.",
      "Which customer support platform would you recommend for a SaaS company in 2026, and why?",
      "Compare the leading help desk tools. Which would you pick?",
    ],
  },
  {
    slug: "accounting-software",
    name: "accounting software",
    questions: [
      "What is the best accounting software for a small business? Name specific products.",
      "Which accounting software would you recommend for a freelancer or startup in 2026, and why?",
      "Compare the leading accounting software options. Which would you pick?",
    ],
  },
  {
    slug: "seo-tools",
    name: "SEO tools",
    questions: [
      "What are the best SEO tools for a small business? Name specific products.",
      "Which SEO tool would you recommend for a content marketing team in 2026, and why?",
      "Compare the leading SEO platforms. Which would you pick?",
    ],
  },
  {
    slug: "website-builders",
    name: "website builders",
    questions: [
      "What is the best website builder for a small business? Name specific products.",
      "Which website builder would you recommend for a startup landing page in 2026, and why?",
      "Compare the leading website builders. Which would you pick?",
    ],
  },
  {
    slug: "marketing-automation-software",
    name: "marketing automation software",
    questions: [
      "What is the best marketing automation software for a small business? Name specific products.",
      "Which marketing automation platform would you recommend for a B2B company in 2026, and why?",
      "Compare the leading marketing automation tools. Which would you pick?",
    ],
  },
  {
    slug: "social-media-management-tools",
    name: "social media management tools",
    questions: [
      "What are the best social media management tools for a small business? Name specific products.",
      "Which social media scheduling tool would you recommend for a marketing team in 2026, and why?",
      "Compare the leading social media management platforms. Which would you pick?",
    ],
  },
  {
    slug: "live-chat-software",
    name: "live chat software",
    questions: [
      "What is the best live chat software for a website? Name specific products.",
      "Which live chat tool would you recommend for a SaaS company in 2026, and why?",
      "Compare the leading live chat and chatbot tools for customer support. Which would you pick?",
    ],
  },
  {
    slug: "applicant-tracking-systems",
    name: "applicant tracking systems",
    questions: [
      "What is the best applicant tracking system for a small company? Name specific products.",
      "Which applicant tracking system would you recommend for a fast-growing startup in 2026, and why?",
      "Compare the leading applicant tracking systems. Which would you pick?",
    ],
  },
  {
    slug: "reddit-marketing-tools",
    name: "Reddit marketing tools",
    questions: [
      "What are the best tools for marketing a product on Reddit? Name specific products.",
      "Which Reddit marketing tool would you recommend for a SaaS startup in 2026, and why?",
      "Compare the leading tools for finding and replying to Reddit threads about your product. Which would you pick?",
    ],
  },
  {
    slug: "ai-visibility-tools",
    name: "AI search visibility tools",
    questions: [
      "What are the best tools to track a brand's visibility in ChatGPT and other AI answers? Name specific products.",
      "Which AI search visibility tool would you recommend for a B2B SaaS company in 2026, and why?",
      "Compare the leading tools for monitoring brand mentions in AI search. Which would you pick?",
    ],
  },
];

export function getCategory(slug) {
  return DATA_CATEGORIES.find((c) => c.slug === slug) || null;
}

// The assistants themselves, which sometimes name themselves in an answer.
const ENGINE_NAMES = new Set(["chatgpt", "claude", "gemini", "perplexity", "openai", "anthropic", "copilot"]);
// "HubSpot CRM", "HubSpot" and "hubspot.com" are one brand.
const keyOf = (name) =>
  String(name)
    .toLowerCase()
    .replace(/\.(com|io|ai|co|app)$/, "")
    .replace(/\s+(crm|software|app|platform|suite)$/, "")
    .replace(/[^a-z0-9]/g, "");

// Answers arrive as markdown; the page shows them as plain quotes.
const plain = (md) =>
  String(md)
    .replace(/\*\*|__/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

let _anthropic = null;
function anthropic() {
  if (!_anthropic && process.env.ANTHROPIC_API_KEY) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

// One call per category: the brands named in each answer, in order.
async function extractBrands(answers) {
  const c = anthropic();
  if (!c || answers.length === 0) return answers.map(() => []);
  const numbered = answers.map((a, i) => `[${i}]\n${a}`).join("\n\n");
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 900,
      system: `You extract product and company names from numbered AI answers.

Return ONLY a JSON array with one entry per answer, in the same order: an array of the distinct real product or company names that literally appear in that answer, in order of first appearance.
- Never add a name that is not in the text.
- Use the product's common name ("HubSpot", not "HubSpot CRM Suite").
- No generic terms. Max 12 names per answer.`,
      messages: [{ role: "user", content: numbered }],
    });
    const raw = res?.content?.[0]?.text || "";
    const arr = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
    return answers.map((answer, i) =>
      (Array.isArray(arr[i]) ? arr[i] : [])
        .filter((s) => typeof s === "string" && s.trim().length >= 2 && s.length <= 40)
        .map((s) => s.trim())
        .filter((s) => !ENGINE_NAMES.has(keyOf(s)))
        // Only names that really occur in the answer.
        .filter((s) => answer.toLowerCase().includes(s.toLowerCase()))
        .filter((s, j, a) => a.findIndex((x) => keyOf(x) === keyOf(s)) === j)
    );
  } catch (e) {
    console.error("[category-data] extraction failed:", e?.message || e);
    return null;
  }
}

/**
 * Asks every category's questions and stores the day's answers. Claude
 * answers all three questions; ChatGPT and Gemini (via Cloro, slow and
 * rate-limited) answer the first question for as many categories as the
 * deadline allows, starting from a different category each day so all of
 * them get coverage.
 */
export async function collectDay({ deadline }) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client not configured");
  const bucket = admin.storage.from(BUCKET);
  const day = new Date().toISOString().slice(0, 10);
  const cloroDeadline = deadline - 25000;
  const offset = Math.floor(Date.now() / 86400000) % DATA_CATEGORIES.length;
  const rotated = [...DATA_CATEGORIES.slice(offset), ...DATA_CATEGORIES.slice(0, offset)];

  const jobs = [];
  for (const cat of DATA_CATEGORIES) {
    for (const q of cat.questions) jobs.push({ cat, engine: "Claude", live: false, question: q, run: () => claudeAsk(q) });
  }
  if (isCloroConfigured()) {
    for (const cat of rotated) {
      const q = cat.questions[0];
      jobs.push({ cat, engine: "ChatGPT", live: false, question: q, run: () => cloroAskChatGPT(q, { deadline: cloroDeadline }) });
      jobs.push({ cat, engine: "Gemini", live: true, question: q, run: () => cloroAskGemini(q, { deadline: cloroDeadline }) });
    }
  }
  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  const answered = jobs
    .map((j, i) => ({ ...j, answer: settled[i].status === "fulfilled" ? settled[i].value : null }))
    .filter((j) => j.answer);

  const out = [];
  await Promise.all(
    DATA_CATEGORIES.map(async (cat) => {
      const rows = answered.filter((j) => j.cat.slug === cat.slug);
      if (rows.length === 0) return out.push({ slug: cat.slug, answers: 0 });
      const brands = await extractBrands(rows.map((r) => r.answer));
      if (!brands) return out.push({ slug: cat.slug, answers: rows.length, error: "extraction failed" });
      const record = {
        date: day,
        category: cat.slug,
        answers: rows.map((r, i) => ({ engine: r.engine, live: r.live, question: r.question, answer: r.answer, brands: brands[i] })),
      };
      const { error } = await bucket.upload(`${cat.slug}/${day}.json`, JSON.stringify(record), {
        contentType: "application/json",
        upsert: true,
        // Storage caches a file for an hour by default; these are rewritten and re-read.
        cacheControl: "60",
      });
      out.push({ slug: cat.slug, answers: rows.length, engines: [...new Set(rows.map((r) => r.engine))], error: error?.message });
    })
  );
  return { day, results: out };
}

const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : 0);

/** Rebuilds one category's 30-day summary from its daily files. */
export async function summarizeCategory(cat) {
  const bucket = createAdminClient().storage.from(BUCKET);
  const { data: files } = await bucket.list(cat.slug, { limit: 200, sortBy: { column: "name", order: "desc" } });
  const dayFiles = (files || []).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f.name)).slice(0, WINDOW_DAYS);
  const days = (
    await Promise.all(
      dayFiles.map(async (f) => {
        const { data } = await bucket.download(`${cat.slug}/${f.name}`);
        try {
          return data ? JSON.parse(await data.text()) : null;
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean);
  if (days.length === 0) return null;
  days.sort((a, b) => a.date.localeCompare(b.date));

  const lastDay = days[days.length - 1].date;
  const weekAgo = new Date(Date.parse(lastDay) - 7 * 86400000).toISOString().slice(0, 10);
  const all = days.flatMap((d) => d.answers.map((a) => ({ ...a, date: d.date })));
  const engines = {};
  for (const a of all) engines[a.engine] = (engines[a.engine] || 0) + 1;
  const recentTotal = all.filter((a) => a.date > weekAgo).length;

  const brands = new Map();
  for (const a of all) {
    // Once per answer, even when it used two spellings of the same brand.
    const seen = new Set();
    for (const name of a.brands || []) {
      const k = keyOf(name);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      const b = brands.get(k) || { names: {}, answers: 0, recent: 0, byEngine: {} };
      b.names[name] = (b.names[name] || 0) + 1;
      b.answers += 1;
      if (a.date > weekAgo) b.recent += 1;
      b.byEngine[a.engine] = (b.byEngine[a.engine] || 0) + 1;
      brands.set(k, b);
    }
  }
  const ranked = [...brands.values()]
    .map((b) => ({
      // Most used spelling; on a tie, the shorter one ("HubSpot" over "HubSpot CRM").
      name: Object.entries(b.names).sort((x, y) => y[1] - x[1] || x[0].length - y[0].length)[0][0],
      answers: b.answers,
      share: pct(b.answers, all.length),
      recentShare: pct(b.recent, recentTotal),
      byEngine: Object.fromEntries(Object.entries(engines).map(([e, n]) => [e, pct(b.byEngine[e] || 0, n)])),
    }))
    .sort((x, y) => y.answers - x.answers)
    .slice(0, 15);

  // The newest answer per engine and question 1, as a quotable sample.
  const latest = [];
  for (const a of [...days[days.length - 1].answers].reverse()) {
    if (!latest.some((l) => l.engine === a.engine)) latest.push({ engine: a.engine, question: a.question, answer: plain(a.answer).slice(0, 900) });
  }

  return {
    slug: cat.slug,
    name: cat.name,
    questions: cat.questions,
    firstDay: days[0].date,
    lastDay,
    days: days.length,
    totalAnswers: all.length,
    engines,
    brands: ranked,
    // Every brand any answer named, not just the top 15, so outreach never
    // tells a brand it was left out when it was named once.
    mentioned: [...brands.keys()],
    // Answers naming each brand, per engine, for every brand (outreach tells
    // a brand which engines name it and which never do).
    mentionedByEngine: Object.fromEntries([...brands].map(([k, b]) => [k, b.byEngine])),
    latest: latest.reverse(),
  };
}

/** Rebuilds every summary plus the index the listing page reads. */
export async function rebuildSummaries() {
  const bucket = createAdminClient().storage.from(BUCKET);
  const index = [];
  for (const cat of DATA_CATEGORIES) {
    const s = await summarizeCategory(cat);
    if (!s) continue;
    await bucket.upload(`${cat.slug}/summary.json`, JSON.stringify(s), { contentType: "application/json", upsert: true, cacheControl: "60" });
    index.push({ slug: s.slug, name: s.name, lastDay: s.lastDay, days: s.days, totalAnswers: s.totalAnswers, top: s.brands.slice(0, 3) });
  }
  await bucket.upload("index.json", JSON.stringify({ updated: new Date().toISOString(), categories: index }), {
    contentType: "application/json",
    upsert: true,
    // Storage caches a file for an hour by default; these are rewritten and re-read.
    cacheControl: "60",
  });
  return index.length;
}

async function readJson(path) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.storage.from(BUCKET).download(path);
  if (!data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

export const loadSummary = (slug) => readJson(`${slug}/summary.json`);
export const loadIndex = () => readJson("index.json");

// ---- Reddit threads per category, for the brand AI reports ----
// The threads where buyers ask for a category's tools: what the AI engines
// read, and where a brand has to be present. Found with Tavily (two searches,
// 1 credit each), then each candidate is opened (ScrapeCreators, up to four
// pages of comments) because the comments are where people name tools. The six
// busiest threads are kept (vendor subreddits have no discussion and drop
// out). Refreshed monthly per category.
const REDDIT_MAX_AGE_MS = 30 * 86400000; // busiest threads barely move; each refresh costs ~26 ScrapeCreators credits
export const REDDIT_VERSION = 3; // bump when the stored shape or source changes

function redditPermalink(url) {
  const m = String(url).match(/reddit\.com\/r\/([^/]+)\/comments\/([a-z0-9]+)(?:\/([^/?#]*))?/i);
  return m ? { sub: m[1], id: m[2], url: `https://www.reddit.com/r/${m[1]}/comments/${m[2]}/${m[3] || ""}` } : null;
}

async function tavilyReddit(query) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, search_depth: "basic", include_domains: ["reddit.com"], max_results: 10 }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const j = await res.json();
  return Array.isArray(j?.results) ? j.results : [];
}

export async function collectReddit(cat) {
  const results = (await Promise.all([`best ${cat.name}`, `${cat.name} recommendations`].map(tavilyReddit))).flat();
  const seen = new Set();
  const candidates = [];
  for (const r of results) {
    const p = redditPermalink(r.url);
    if (!p || seen.has(p.id)) continue;
    seen.add(p.id);
    candidates.push(p);
    if (candidates.length >= 8) break;
  }
  // Two passes to keep credits down: one page of each candidate (1 credit) to
  // rank them by comment count, then three pages (up to ~75 comments) for the
  // six kept, so "is the brand in this thread" is judged on the discussion.
  const light = await Promise.all(candidates.map((c) => fetchThread(c.url, { timeoutMs: 30000, pages: 1, allComments: true }).catch(() => null)));
  const kept = candidates
    .map((c, i) => ({ c, t: light[i] }))
    .filter(({ t }) => t && t.title && t.comments.length >= 3)
    // Busiest first; text length breaks ties when counts are missing (Apify fallback).
    .sort((a, b) => b.t.numComments - a.t.numComments || b.t.comments.map((x) => x.body).join("").length - a.t.comments.map((x) => x.body).join("").length)
    .slice(0, 6);
  const deep = await Promise.all(
    kept.map(({ c, t }) => (t.numComments > 25 ? fetchThread(c.url, { timeoutMs: 30000, pages: 3, allComments: true }).catch(() => null) : null))
  );
  const threads = kept.map(({ c, t }, i) => {
    const full = deep[i] || t;
    return {
      title: full.title,
      sub: c.sub,
      url: c.url,
      ups: full.ups,
      comments: full.numComments,
      createdAt: full.createdAt,
      text: [full.title, full.selftext, ...full.comments.map((x) => x.body)].join("\n").slice(0, 60000),
    };
  });
  // Saved even when empty, so a failing source is retried monthly, not daily
  // (each try costs Tavily and ScrapeCreators credits). Keep the old list over an empty one.
  if (threads.length === 0) {
    const cur = await loadReddit(cat.slug);
    if (cur?.v === REDDIT_VERSION && cur.threads.length) {
      threads.push(...cur.threads);
    }
  }
  await createAdminClient()
    .storage.from(BUCKET)
    .upload(`${cat.slug}/reddit.json`, JSON.stringify({ v: REDDIT_VERSION, updated: new Date().toISOString(), threads }), {
      contentType: "application/json",
      upsert: true,
      // Storage caches a file for an hour by default; these are rewritten and re-read.
      cacheControl: "60",
    });
  return threads.length;
}

/** Refreshes the Reddit threads of categories whose list is a month old, missing or an old shape. */
export async function refreshReddit({ deadline }) {
  const out = {};
  for (const cat of DATA_CATEGORIES) {
    if (Date.now() > deadline - 95000) break; // one category takes up to ~90s
    const cur = await loadReddit(cat.slug);
    if (cur?.v === REDDIT_VERSION && Date.now() - Date.parse(cur.updated) < REDDIT_MAX_AGE_MS) continue;
    out[cat.slug] = await collectReddit(cat).catch(() => 0);
  }
  return out;
}

export const loadReddit = (slug) => readJson(`${slug}/reddit.json`);
