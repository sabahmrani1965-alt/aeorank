// Reddit API client with OAuth support.
//
// In production, Reddit blocks unauthenticated requests from cloud datacenter
// IPs (Vercel, AWS, GCP, etc.) with 403 Forbidden. The fix is to authenticate
// using the OAuth password-grant flow, which is what Reddit's "script" type
// apps are designed for. Requires four env vars:
//
//   REDDIT_CLIENT_ID      — short id under your script app on https://www.reddit.com/prefs/apps
//   REDDIT_CLIENT_SECRET  — the "secret" string on the same app
//   REDDIT_USERNAME       — your Reddit account's username
//   REDDIT_PASSWORD       — your Reddit account's password
//
// If credentials aren't set, we fall back to the public unauthenticated
// endpoints (which work in local dev but are 403'd on Vercel).

const UA = "AEOrank/1.0 (https://aeorank.com)";

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

async function getToken() {
  if (!hasOAuth()) return null;
  // Re-use cached token until 30s before expiry
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
      body: new URLSearchParams({
        grant_type: "password",
        username,
        password,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[reddit] OAuth token request failed:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    if (!data.access_token) {
      console.error("[reddit] OAuth response missing access_token:", JSON.stringify(data).slice(0, 200));
      return null;
    }
    cachedToken = data.access_token;
    cachedExpiry = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedToken;
  } catch (e) {
    console.error("[reddit] OAuth fetch error:", e?.message || e);
    return null;
  }
}

// Fetch JSON from Reddit. When OAuth is configured we hit oauth.reddit.com
// (no IP blocks, 100 req/min/account). Otherwise fall back to the public
// www.reddit.com endpoint.
async function rj(path) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const token = await getToken();
    // www.reddit.com 403s Vercel IPs; old.reddit.com sometimes still serves
    // unauthenticated JSON. Prefer OAuth if we have it, otherwise try old.
    const baseUrl = token
      ? "https://oauth.reddit.com"
      : "https://old.reddit.com";
    const url = baseUrl + path;
    const headers = {
      "User-Agent": UA,
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      headers,
      signal: ctrl.signal,
      next: { revalidate: 600 }, // 10 min cache
    });
    if (!res.ok) {
      console.error(
        `[reddit] ${res.status} ${res.statusText} from ${url}`,
        "auth:", token ? "oauth" : "public",
        "ratelimit-remaining:", res.headers.get("x-ratelimit-remaining"),
      );
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`[reddit] fetch failed for ${path}:`, e?.message || e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

function pickIcon(d) {
  return (d.icon_img || d.community_icon || "").split("?")[0] || "";
}

export async function searchSubreddits(query, limit = 12) {
  const j = await rj(
    `/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}&include_over_18=off`
  );
  if (!j?.data?.children) return [];
  return j.data.children
    .map((c) => c.data)
    .filter((d) => d && d.subscribers != null)
    .map((d) => ({
      name: d.display_name_prefixed || `r/${d.display_name}`,
      url: `https://www.reddit.com/${d.display_name_prefixed || "r/" + d.display_name}/`,
      members: d.subscribers,
      desc: (d.public_description || d.title || "").slice(0, 80),
      icon: pickIcon(d),
    }));
}

export async function searchPosts(query, limit = 12) {
  const j = await rj(
    `/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=month&include_over_18=off`
  );
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
      created: d.created_utc * 1000,
      permalink: "https://www.reddit.com" + d.permalink,
    }));
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
