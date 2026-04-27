// Reddit's public JSON endpoints — read-only, no auth, no posting.

const UA = "AEOrank/1.0 (https://aeorank.com)";

async function rj(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: ctrl.signal,
      next: { revalidate: 600 }, // 10 min cache
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
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
    `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}&include_over_18=off`
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
    `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=month&include_over_18=off`
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
