// Data behind the free Reddit tools (/tools/*): subreddit finder, best time
// to post, brand mention checker and subreddit rules checker. Everything
// comes from ScrapeCreators (Reddit blocks cloud IPs), which charges about a
// credit per call, so these public pages are guarded three ways:
//   - each result is cached by its input (unstable_cache) for 1 to 7 days,
//     so repeat lookups cost nothing;
//   - credits spent on cache misses are capped per visitor IP and overall
//     per UTC day, recorded as small files in the private free-checks
//     bucket (the same approach as the free AI visibility checker);
//   - a failed lookup throws, so it is never cached.
import { AsyncLocalStorage } from "async_hooks";
import { createHash } from "crypto";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const API = "https://api.scrapecreators.com/v1/reddit";
const BUCKET = "free-checks";
const PER_IP_CREDITS = 40;
const DAILY_CREDITS = Number(process.env.REDDIT_TOOLS_DAILY_CREDITS || 300);
const DAY = 86400;

export class ToolError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// The visitor making the current request, for the per-IP credit cap. Kept
// out of the cached functions' arguments so it doesn't split the cache.
const visitor = new AsyncLocalStorage();

export function ipHashFrom(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  return createHash("sha256").update(`${ip}|${process.env.CRON_SECRET || "aeorank"}`).digest("hex").slice(0, 20);
}

export function withVisitor(ipHash, fn) {
  return visitor.run({ ipHash }, fn);
}

// Reserves `credits` against today's caps before a cache miss spends them.
async function reserve(tool, credits) {
  const admin = createAdminClient();
  if (!admin) throw new ToolError("This tool is unavailable right now. Try again later.", 503);
  const day = new Date().toISOString().slice(0, 10);
  const dir = `tools/${day}`;
  const { data, error } = await admin.storage.from(BUCKET).list(dir, { limit: 1000 });
  if (error) throw new ToolError("This tool is unavailable right now. Try again later.", 503);
  const ipHash = visitor.getStore()?.ipHash || "unknown";
  const spent = (files) => files.reduce((n, f) => n + (Number(f.name.match(/_(\d+)c_/)?.[1]) || 0), 0);
  const all = data || [];
  if (spent(all) + credits > DAILY_CREDITS)
    throw new ToolError("Today's free lookups are used up. Please try again tomorrow.", 429);
  if (spent(all.filter((f) => f.name.endsWith(`_i${ipHash}.json`))) + credits > PER_IP_CREDITS)
    throw new ToolError("You've reached today's free lookups. Try again tomorrow.", 429);
  await admin.storage
    .from(BUCKET)
    .upload(`${dir}/${Date.now()}_${tool}_${credits}c_i${ipHash}.json`, "{}", { contentType: "application/json" });
}

async function sc(path, params) {
  const key = process.env.SCRAPECREATORS_API_KEY;
  if (!key) throw new ToolError("This tool is unavailable right now. Try again later.", 503);
  const url = `${API}/${path}?${new URLSearchParams(params)}`;
  // One retry: the API returns an occasional 500 that succeeds right after.
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, { headers: { "x-api-key": key }, cache: "no-store", signal: ctrl.signal });
      const body = await res.json().catch(() => null);
      if (body?.success) return body;
      if (res.status === 404 || res.status === 400) return null;
      console.error(`[reddit-tools] ${path} ${res.status}`, body?.message || "");
    } catch (e) {
      console.error(`[reddit-tools] ${path} failed:`, e?.message || e);
    } finally {
      clearTimeout(t);
    }
  }
  throw new ToolError("Reddit didn't answer in time. Please try again in a minute.", 502);
}

// "r/SaaS", "https://www.reddit.com/r/SaaS/" or "SaaS" -> "SaaS", else null.
export function normalizeSubreddit(input) {
  const s = String(input || "").trim();
  const name = (s.match(/reddit\.com\/r\/([A-Za-z0-9_]+)/i) || s.match(/^\/?r\/([A-Za-z0-9_]+)\/?$/i) || [null, s])[1];
  return /^[A-Za-z0-9_]{2,21}$/.test(name || "") ? name : null;
}

const cleanQuery = (q) => String(q || "").replace(/\s+/g, " ").trim().slice(0, 60);

const isProfileSub = (name) => /^u_/i.test(name || "");

function mapPost(p) {
  return {
    sub: p.subreddit,
    title: p.title || "",
    score: p.score ?? p.ups ?? 0,
    comments: p.num_comments || 0,
    created: (p.created_utc || 0) * 1000,
    url: p.permalink ? `https://www.reddit.com${p.permalink}` : p.url,
  };
}

async function details(sub) {
  const d = await sc("subreddit/details", { subreddit: sub });
  if (!d) return null;
  return {
    name: d.display_name || sub,
    weeklyVisitors: Number(d.weekly_active_users) || null,
    weeklyContributions: Number(d.weekly_contributions) || null,
    description: (d.description || "").trim(),
    rules: d.rules || "",
    createdAt: d.created_at || null,
    icon: (d.icon_img || "").split("?")[0] || "",
  };
}

// Pages of a search, following the cursor; each page is one credit.
async function searchPages(params, pages) {
  const posts = [];
  let after = null;
  for (let i = 0; i < pages; i++) {
    const b = await sc("search", { ...params, ...(after ? { after } : {}) });
    if (!b) break;
    posts.push(...(b.posts || []));
    if (!b.after) break;
    after = b.after;
  }
  return posts.filter((p) => !p.over_18 && !isProfileSub(p.subreddit));
}

/* ── Subreddit finder ─────────────────────────────────────────── */

const FINDER_PAGES = 4;
const FINDER_DETAILS = 6;

export const findSubreddits = unstable_cache(
  async (q) => {
    await reserve("finder", FINDER_PAGES + FINDER_DETAILS);
    const yearAgo = Date.now() / 1000 - 365 * DAY;
    const all = await searchPages({ query: q, sort: "relevance", timeframe: "year" }, FINDER_PAGES);
    // The timeframe isn't always honoured; keep the claim on the page true.
    const posts = all.filter((p) => (p.created_utc || 0) >= yearAgo);
    console.log(`[reddit-tools] finder "${q}": ${posts.length}/${all.length} posts within a year`);
    const bySub = new Map();
    for (const p of posts) {
      const s = bySub.get(p.subreddit) || { name: p.subreddit, posts: 0, score: 0, comments: 0, examples: [] };
      s.posts++;
      s.score += p.score || 0;
      s.comments += p.num_comments || 0;
      if (s.examples.length < 2) s.examples.push(mapPost(p));
      bySub.set(p.subreddit, s);
    }
    const ranked = [...bySub.values()].sort((a, b) => b.posts - a.posts || b.comments - a.comments);
    const top = ranked.slice(0, FINDER_DETAILS);
    const info = await Promise.all(top.map((s) => details(s.name).catch(() => null)));
    return {
      query: q,
      at: new Date().toISOString(),
      subreddits: [
        ...top.map((s, i) => ({ ...s, ...(info[i] ? { weeklyVisitors: info[i].weeklyVisitors, weeklyContributions: info[i].weeklyContributions, description: info[i].description.slice(0, 220) } : {}) })),
        ...ranked.slice(FINDER_DETAILS, 12),
      ],
    };
  },
  ["reddit-tools-finder-v2"],
  { revalidate: 7 * DAY }
);

/* ── Best time to post ────────────────────────────────────────── */

const TIMING_PAGES = 3;

export const subredditTiming = unstable_cache(
  async (sub) => {
    await reserve("timing", TIMING_PAGES);
    const posts = [];
    let after = null;
    for (let i = 0; i < TIMING_PAGES; i++) {
      const b = await sc("subreddit", { subreddit: sub, sort: "top", timeframe: "month", ...(after ? { after } : {}) });
      if (!b) break;
      posts.push(...(b.posts || []));
      if (!b.after) break;
      after = b.after;
    }
    if (!posts.length) throw new ToolError(`We couldn't read r/${sub}. Check the name; private and banned subreddits can't be read.`, 404);
    return {
      sub: posts[0]?.subreddit || sub,
      at: new Date().toISOString(),
      // Only what the chart needs; it is drawn in the visitor's time zone.
      posts: posts.filter((p) => !p.stickied).map((p) => ({ t: (p.created_utc || 0) * 1000, score: p.score || 0, comments: p.num_comments || 0 })),
      top: posts.slice(0, 5).map(mapPost),
    };
  },
  ["reddit-tools-timing-v1"],
  { revalidate: 7 * DAY }
);

/* ── Brand mention checker ────────────────────────────────────── */

const MENTION_PAGES = 3;

export const brandMentions = unstable_cache(
  async (brand) => {
    await reserve("mentions", MENTION_PAGES);
    const posts = await searchPages({ query: `"${brand}"`, sort: "new", timeframe: "month" }, MENTION_PAGES);
    // Search also matches on the subreddit and loose spellings; keep posts
    // that really say the name.
    const word = new RegExp(`(^|[^a-z0-9])${brand.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
    // Crossposts repeat the same title in several subreddits: keep the first.
    // Search ignores the month timeframe when sorting by new, so the window
    // is applied here.
    const monthAgo = Date.now() / 1000 - 30 * DAY;
    const recent = posts.filter((p) => (p.created_utc || 0) >= monthAgo);
    const seen = new Set();
    const hits = recent
      .filter((p) => {
        const k = (p.title || "").trim().toLowerCase();
        return word.test(`${p.title} ${p.selftext || ""}`) && !seen.has(k) && seen.add(k);
      })
      .map(mapPost)
      .sort((a, b) => b.created - a.created);
    const subs = new Map();
    for (const h of hits) subs.set(h.sub, (subs.get(h.sub) || 0) + 1);
    return {
      brand,
      at: new Date().toISOString(),
      mentions: hits.slice(0, 25),
      total: hits.length,
      // A busy brand fills every page with the last few hours of posts, so
      // the count is a floor over that span, not a monthly total.
      capped: posts.length >= MENTION_PAGES * 6 && recent.length === posts.length,
      since: hits.length ? hits[hits.length - 1].created : null,
      subreddits: [...subs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  },
  ["reddit-tools-mentions-v3"],
  { revalidate: DAY }
);

/* ── Subreddit rules checker ──────────────────────────────────── */

const RULE_FLAGS = [
  { key: "promo", label: "Self-promotion limited", re: /self[- ]?promo|promot|advertis|marketing|spam|sell(ing)?\b|affiliate|referral/i },
  { key: "links", label: "Link rules", re: /\blinks?\b|\burls?\b|domain|blog ?posts?/i },
  { key: "account", label: "Karma or account age", re: /karma|account age|days old|new accounts?|account must/i },
  { key: "ai", label: "AI content rules", re: /\bai\b|chatgpt|gpt|llm|generated|artificial intelligence/i },
  { key: "flair", label: "Post flair", re: /flair/i },
  { key: "title", label: "Title rules", re: /\btitles?\b/i },
  { key: "thread", label: "Use a megathread", re: /megathread|weekly thread|monthly thread|stickied|designated thread|daily thread/i },
];

function parseRules(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((r) => r.replace(/^\s*\d+[.)]?\s*/, "").trim())
    .filter(Boolean)
    .map((body) => ({ body, flags: RULE_FLAGS.filter((f) => f.re.test(body)).map((f) => f.key) }));
}

export const subredditRules = unstable_cache(
  async (sub) => {
    await reserve("rules", 1);
    const d = await details(sub);
    if (!d) throw new ToolError(`We couldn't find r/${sub}. Check the name; private and banned subreddits can't be read.`, 404);
    const rules = parseRules(d.rules);
    return {
      sub: d.name,
      at: new Date().toISOString(),
      weeklyVisitors: d.weeklyVisitors,
      weeklyContributions: d.weeklyContributions,
      description: d.description,
      createdAt: d.createdAt,
      rules,
      flags: RULE_FLAGS.filter((f) => rules.some((r) => r.flags.includes(f.key))).map(({ key, label }) => ({ key, label })),
    };
  },
  ["reddit-tools-rules-v1"],
  { revalidate: 7 * DAY }
);

export const cleanBrand = cleanQuery;
export const cleanTopic = cleanQuery;
