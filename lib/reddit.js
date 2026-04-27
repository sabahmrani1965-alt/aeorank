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
const APIFY_TIMEOUT_MS = 25000; // leave 5s headroom under Vercel's 30s function limit

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

// ------- Apify (path 2) -------

async function runApify(input) {
  const token = process.env.APIFY_API_TOKEN;
  const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${token}&memory=1024`;
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
      console.error(`[apify] ${res.status} ${res.statusText}`, body.slice(0, 200));
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("[apify] failed:", e?.message || e);
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

// ------- Direct Reddit (path 3, local-dev fallback) -------

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
  // Path 2: Apify
  if (hasApify()) {
    const items = await runApify({
      searches: [query],
      type: "community",
      searchPosts: false,
      searchComments: false,
      searchCommunities: true,
      searchUsers: false,
      skipComments: true,
      skipUserPosts: true,
      skipCommunity: false,
      maxItems: limit,
      maxCommunitiesCount: limit,
      proxy: { useApifyProxy: true },
    });
    if (items) return items.map(mapApifyCommunity).filter((x) => x.members > 0).slice(0, limit);
  }
  // Path 3: direct fallback
  const j = await rjDirect(
    `/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}&include_over_18=off`
  );
  return mapRedditChildrenCommunity(j);
}

export async function searchPosts(query, limit = 12) {
  if (hasOAuth()) {
    const j = await rjOAuth(
      `/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=month&include_over_18=off`
    );
    if (j) return mapRedditChildrenPost(j);
  }
  if (hasApify()) {
    const items = await runApify({
      searches: [query],
      type: "posts",
      searchPosts: true,
      searchComments: false,
      searchCommunities: false,
      searchUsers: false,
      skipComments: true,
      skipUserPosts: true,
      skipCommunity: true,
      sort: "relevance",
      time: "month",
      maxItems: limit,
      maxPostCount: limit,
      maxComments: 0,
      proxy: { useApifyProxy: true },
    });
    if (items) return items.map(mapApifyPost).slice(0, limit);
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
