// Reddit data layer with three fetch strategies, picked at request time:
//
//   1. Reddit OAuth (oauth.reddit.com) — when REDDIT_CLIENT_ID/SECRET/USERNAME/PASSWORD are set.
//      This requires a "script" type app at https://www.reddit.com/prefs/apps,
//      which Reddit currently restricts globally for new accounts.
//
//   2. Apify Reddit Scraper Lite — when APIFY_API_TOKEN is set.
//      Runs through Apify's residential proxy network. Slower (~20-40s per run)
//      but reliable from any cloud IP. Sign up at https://apify.com.
//
//   3. Direct Reddit (www.reddit.com / old.reddit.com) — fallback for local dev.
//      Will return 403 from Vercel/AWS/GCP IPs.

const UA = "AEOrank/1.0 (https://aeorank.com)";
const APIFY_ACTOR = "trudax~reddit-scraper-lite";
const APIFY_TIMEOUT_MS = 28000; // leave a small headroom under Vercel's 30s function limit

let cachedToken = null;
let cachedExpiry = 0;

function hasOAuth() {
  return Boolean(
    process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET &&
      process.env.REDDIT_USERNAME &&
      process.env.REDDIT_PASSWORD
  );
}

function hasApify() {
  return Boolean(process.env.APIFY_API_TOKEN);
}

// ------- Reddit OAuth (path 1) -------

async function getToken() {
  if (!hasOAuth()) return null;
  if (cachedToken && Date.now() < cachedExpiry - 30_000) return cachedToken;

  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
      },
      body: new URLSearchParams({ grant_type: "password", username, password }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[reddit] OAuth token failed:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    if (!data.access_token) return null;
    cachedToken = data.access_token;
    cachedExpiry = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedToken;
  } catch (e) {
    console.error("[reddit] OAuth error:", e?.message || e);
    return null;
  }
}

async function rjOAuth(path) {
  const token = await getToken();
  if (!token) return null;
  const url = `https://oauth.reddit.com${path}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Authorization: `Bearer ${token}`, Accept: "application/json" },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      console.error(`[reddit oauth] ${res.status} from ${url}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("[reddit oauth] failed:", e?.message || e);
    return null;
  }
}

// ------- Tavily Search (path 2) — live data via web search -------
//
// Tavily's Search API indexes Reddit in near-real-time. Free tier:
// 1,000 credits/month, no credit card required. Each basic search = 1
// credit. We restrict to reddit.com via include_domains and parse the
// subreddit + permalink out of each result URL. Tradeoff vs. Reddit's
// native API: no upvote/comment counts, no author — but we get title,
// snippet, subreddit, freshness — enough for the post grid to feel
// current.

const TAVILY_URL = "https://api.tavily.com/search";
const TAVILY_TIMEOUT_MS = 8000;

function hasTavily() {
  return Boolean(process.env.TAVILY_API_KEY);
}

// Pull r/<sub> + permalink out of a Reddit URL like:
//   https://www.reddit.com/r/SaaS/comments/abc/title-slug/
function parseRedditUrl(url) {
  try {
    const u = new URL(url);
    if (!/(^|\.)reddit\.com$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/r\/([^/]+)\/comments\/([^/]+)/i);
    if (!m) return null;
    return {
      sub: `r/${m[1]}`,
      permalink: `https://www.reddit.com/r/${m[1]}/comments/${m[2]}/`,
    };
  } catch {
    return null;
  }
}

async function tavilySearchPosts(query, limit) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return null;
  // time_range="month" mirrors Reddit's t=month filter. max_results capped
  // at 20 by Tavily on basic search.
  const max_results = Math.min(20, Math.max(limit * 2, limit));
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TAVILY_TIMEOUT_MS);
  try {
    const res = await fetch(TAVILY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        search_depth: "basic", // 1 credit per call (advanced is 2)
        include_domains: ["reddit.com"],
        max_results,
        time_range: "month",
      }),
      signal: ctrl.signal,
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[tavily/posts] ${res.status} ${res.statusText}`, body.slice(0, 200));
      return null;
    }
    const j = await res.json();
    const items = Array.isArray(j?.results) ? j.results : [];
    const posts = [];
    for (const r of items) {
      const parsed = parseRedditUrl(r.url || "");
      if (!parsed) continue;
      const created = r.published_date
        ? new Date(r.published_date).getTime()
        : Date.now();
      posts.push({
        sub: parsed.sub,
        author: "", // not surfaced by Tavily
        title: (r.title || "").replace(/\s*: r\/[^ ]+\s*$/i, "").replace(/\s*-\s*reddit\s*$/i, ""),
        snippet: (r.content || "").slice(0, 130).replace(/<[^>]+>/g, ""),
        ups: 0, // unknown via web search
        comments: 0, // unknown via web search
        created,
        permalink: parsed.permalink,
      });
      if (posts.length >= limit) break;
    }
    console.log(`[tavily/posts] q="${query}" returned ${posts.length}`);
    return posts;
  } catch (e) {
    console.error("[tavily/posts] failed:", e?.message || e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Derive a subreddit list from Tavily results — same pattern as the
// Pullpush-derived helper, but the underlying data is current.
async function tavilyDerivedSubs(query, limit) {
  const posts = await tavilySearchPosts(query, 20);
  if (!posts || posts.length === 0) return [];
  const counts = new Map();
  for (const p of posts) {
    if (!p.sub || p.sub === "r/?") continue;
    counts.set(p.sub, (counts.get(p.sub) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => ({
      name,
      url: `https://www.reddit.com/${name}/`,
      members: 0,
      desc: "",
      icon: "",
    }));
}

// ------- Apify (path 3) -------

async function runApify(input, label = "apify") {
  const token = process.env.APIFY_API_TOKEN;
  // 512 MB per run. Free Apify plan caps total concurrent memory at
  // 8192 MB. Each report fires 3 parallel calls — at 512 MB that's
  // 1536 MB per report, leaving headroom for ~5 concurrent reports.
  // We previously tried 2048 (failed at 1 concurrent overlap) and 1024
  // (failed at 2-3 concurrent during dev testing). Slower per call but
  // dramatically more reliable.
  // timeout=60 = max actor runtime; we'll abort sooner client-side.
  const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${token}&memory=512&timeout=60`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), APIFY_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: ctrl.signal,
      next: { revalidate: 600 }, // cache identical queries for 10 min
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[${label}] ${res.status} ${res.statusText}`, body.slice(0, 300));
      return null;
    }
    const items = await res.json();
    const first = items?.[0];
    console.log(
      `[${label}] returned ${items?.length || 0} items` +
        (first
          ? ` | dataType=${first.dataType} keys=[${Object.keys(first).slice(0, 12).join(",")}]`
          : "")
    );
    return items;
  } catch (e) {
    console.error(`[${label}] failed:`, e?.message || e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

function mapApifyCommunity(d) {
  const slug = d.communityName || (d.url || "").split("/r/")[1]?.replace(/\/$/, "") || "";
  const name = slug ? `r/${slug}` : (d.title || "r/?");
  return {
    name,
    url: d.url || `https://www.reddit.com/r/${slug}/`,
    members: d.numberOfMembers ?? d.subscribers ?? 0,
    desc: (d.description || d.title || "").slice(0, 80),
    icon: d.iconImage || d.banner || "",
  };
}

function mapApifyPost(d) {
  const sub = d.communityName ? `r/${d.communityName}` : "r/?";
  return {
    sub,
    author: d.username || "unknown",
    title: d.title || "",
    snippet: (d.body || "").slice(0, 110),
    ups: d.upVotes ?? d.score ?? 0,
    comments: d.numberOfComments ?? 0,
    created: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
    permalink: d.url || "https://www.reddit.com/",
  };
}

// ------- Pullpush.io (path 3) — free Reddit archive, works from any IP -------
//
// Pullpush is a community-run continuation of Pushshift. It exposes
// Reddit's submission/comment data through a JSON API that doesn't
// require auth and isn't IP-blocked from Vercel. Data lags ~24-72h
// behind live Reddit, which is fine for an SEO-style report. We use it
// for post search only — it doesn't expose subreddit metadata, so
// communities still go through Apify.

const PULLPUSH_BASE = "https://api.pullpush.io/reddit/search";
const PULLPUSH_TIMEOUT_MS = 8000;

async function pullpushSearchPosts(query, limit) {
  // Limit to last 30 days. Pullpush requires a unix timestamp for `after`
  // — the "30d" shorthand that worked on legacy Pushshift gets silently
  // rejected here, returning an empty result.
  const after = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const url =
    `${PULLPUSH_BASE}/submission/?q=${encodeURIComponent(query)}` +
    `&size=${limit}&sort=desc&sort_type=score&after=${after}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PULLPUSH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: ctrl.signal,
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      console.error(`[pullpush/posts] ${res.status} ${res.statusText}`);
      return null;
    }
    const j = await res.json();
    if (!Array.isArray(j?.data)) return null;
    return j.data
      .filter((d) => d && d.title && d.selftext !== "[removed]" && d.selftext !== "[deleted]")
      .filter((d) => !d.over_18) // drop NSFW
      .map((d) => ({
        sub: d.subreddit ? `r/${d.subreddit}` : "r/?",
        author: d.author || "unknown",
        title: d.title,
        snippet: (d.selftext || "").slice(0, 110),
        ups: d.score || 0,
        comments: d.num_comments || 0,
        created: (d.created_utc || 0) * 1000,
        permalink: d.full_link || `https://www.reddit.com${d.permalink || "/"}`,
      }));
  } catch (e) {
    console.error("[pullpush/posts] failed:", e?.message || e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Derive a subreddit list from Pullpush post results — used as a free
// fallback when Apify's community search comes up empty (e.g. the actor
// hit the free-tier memory cap). We don't get member counts or icons
// this way, but we do get the subs that are actually publishing relevant
// content, ranked by how often they appear.
async function pullpushDerivedSubs(query, limit) {
  // Pull a wider net than the post grid — we want enough sample posts
  // to rank subs reliably. Capped at 50 to keep the response small.
  const posts = await pullpushSearchPosts(query, 50);
  if (!posts || posts.length === 0) return [];
  const counts = new Map();
  for (const p of posts) {
    if (!p.sub || p.sub === "r/?") continue;
    counts.set(p.sub, (counts.get(p.sub) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => ({
      name,
      url: `https://www.reddit.com/${name}/`,
      members: 0, // unknown without metadata fetch
      desc: "",
      icon: "",
    }));
}

// ------- Direct Reddit (path 4, local-dev fallback) -------

async function rjDirect(path) {
  try {
    const res = await fetch(`https://www.reddit.com${path}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      console.error(`[reddit direct] ${res.status} from ${path}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("[reddit direct] failed:", e?.message || e);
    return null;
  }
}

function mapRedditChildrenCommunity(j) {
  if (!j?.data?.children) return [];
  return j.data.children
    .map((c) => c.data)
    .filter((d) => d && d.subscribers != null)
    .map((d) => ({
      name: d.display_name_prefixed || `r/${d.display_name}`,
      url: `https://www.reddit.com/${d.display_name_prefixed || "r/" + d.display_name}/`,
      members: d.subscribers,
      desc: (d.public_description || d.title || "").slice(0, 80),
      icon: (d.icon_img || d.community_icon || "").split("?")[0] || "",
    }));
}

function mapRedditChildrenPost(j) {
  if (!j?.data?.children) return [];
  return j.data.children
    .map((c) => c.data)
    .filter((d) => d && d.title)
    .map((d) => ({
      sub: d.subreddit_name_prefixed || `r/${d.subreddit}`,
      author: d.author,
      title: d.title,
      snippet: (d.selftext || "").slice(0, 110),
      ups: d.ups || 0,
      comments: d.num_comments || 0,
      created: (d.created_utc || 0) * 1000,
      permalink: "https://www.reddit.com" + (d.permalink || "/"),
    }));
}

// ------- Public API -------

export async function searchSubreddits(query, limit = 12) {
  // Path 1: OAuth
  if (hasOAuth()) {
    const j = await rjOAuth(
      `/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}&include_over_18=off`
    );
    if (j) return mapRedditChildrenCommunity(j);
  }
  // Path 2: Tavily Search — derive subs from live web results.
  if (hasTavily()) {
    const derived = await tavilyDerivedSubs(query, limit);
    if (derived.length > 0) return derived;
  }
  // Path 3: Apify (paid, will silently no-op when out of credits)
  if (hasApify()) {
    const items = await runApify(
      {
        searches: [query],
        searchPosts: false,
        searchComments: false,
        searchCommunities: true,
        searchUsers: false,
        skipComments: true,
        skipUserPosts: true,
        skipCommunity: false,
        maxItems: limit,
        maxCommunitiesCount: limit,
        maxPostCount: 0,
        maxComments: 0,
        proxy: { useApifyProxy: true },
      },
      "apify/subs"
    );
    if (items) {
      const apifySubs = items
        .map(mapApifyCommunity)
        .filter((x) => x.members > 0)
        .slice(0, limit);
      if (apifySubs.length > 0) return apifySubs;
    }
    // Apify configured but failed or returned nothing — try Pullpush-derived
    // subs as a free fallback. We won't have member counts but at least the
    // section won't be empty.
    const derived = await pullpushDerivedSubs(query, limit);
    if (derived.length > 0) return derived;
    return [];
  }
  // Path 4: Pullpush-derived subs (stale ~11mo but better than empty)
  const derived = await pullpushDerivedSubs(query, limit);
  if (derived.length > 0) return derived;
  // Path 5: direct fallback (local dev only — Reddit blocks cloud IPs)
  const j = await rjDirect(
    `/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}&include_over_18=off`
  );
  return mapRedditChildrenCommunity(j);
}

export async function searchPosts(query, limit = 12) {
  // Path 1: OAuth (free, unused — Reddit blocks new script-app creation)
  if (hasOAuth()) {
    const j = await rjOAuth(
      `/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=month&include_over_18=off`
    );
    if (j) return mapRedditChildrenPost(j);
  }
  // Path 2: Tavily Search (live data, free 1k/mo). Primary in production.
  if (hasTavily()) {
    const tav = await tavilySearchPosts(query, limit);
    if (tav && tav.length > 0) return tav;
  }
  // Path 3: Pullpush.io (free archive, ~11mo stale). Posts are old but real.
  const pp = await pullpushSearchPosts(query, limit);
  if (pp && pp.length > 0) return pp.slice(0, limit);

  // Path 4: Apify fallback (paid)
  if (hasApify()) {
    // Use searches with explicit post-only flags. Smaller cap + tighter scroll
    // timeout to keep the actor under our 28s ceiling.
    const tight = Math.min(limit, 6);
    const items = await runApify(
      {
        searches: [query],
        searchPosts: true,
        searchComments: false,
        searchCommunities: false,
        searchUsers: false,
        skipComments: true,
        skipUserPosts: true,
        skipCommunity: true,
        sort: "relevance",
        time: "month",
        maxItems: tight,
        maxPostCount: tight,
        maxComments: 0,
        maxCommunitiesCount: 0,
        maxUserCount: 0,
        scrollTimeout: 15, // was 40 — short-circuit faster
        proxy: { useApifyProxy: true },
      },
      "apify/posts"
    );
    if (items) {
      const posts = items
        .filter((d) => (d.dataType === "post" || (d.title && !d.numberOfMembers)))
        .map(mapApifyPost)
        .filter((p) => p.title)
        .slice(0, limit);
      if (posts.length > 0) return posts;
    }
    // Apify configured but returned nothing usable — return empty rather
    // than firing a guaranteed-403 direct request from Vercel.
    return [];
  }
  const j = await rjDirect(
    `/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=month&include_over_18=off`
  );
  return mapRedditChildrenPost(j);
}

export function timeAgo(ms) {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? "s" : ""} ago`;
}

export function formatMembers(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
