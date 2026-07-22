// Tiny, dependency-free display-formatting helpers — deliberately kept
// free of any Node-only APIs (unlike lib/reddit.js, which uses Buffer)
// so they're always safe to import from client components too.

// report_drafts.subreddit is stored WITH the "r/" prefix already (e.g.
// "r/SaaS" — see lib/reddit.js's mapRedditChildrenPost/mapApifyPost and
// parseRedditUrl, all of which produce that format). Display code should
// call this rather than assuming either convention, so a stray
// differently-formatted row never renders as "r/r/SaaS".
export function displaySubreddit(sub) {
  return String(sub || "").trim().replace(/^r\//i, "");
}

// Which task types are aimed at an existing Reddit thread. A 'post' is
// brand new, so it has nothing to point at — everything else does, and
// without the link the poster fulfilling the task can't find the thread.
export function needsTargetUrl(type) {
  return type === "comment" || type === "reply" || type === "upvote";
}

// Validates + canonicalises a user-pasted Reddit thread link. Returns null
// for anything that isn't a reddit.com URL, so callers can treat null as
// "reject" rather than storing an off-site link a poster would be asked to
// go interact with. Deliberately permissive about the path (old./new./www.,
// share links, /comments/<id>/ with or without a slug) — normalising the
// path shape is parseRedditUrl's job in lib/reddit.js, not this one.
export function normalizeRedditUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "reddit.com" && !host.endsWith(".reddit.com")) return null;
  // Drop tracking/query noise so the same thread doesn't get stored under
  // several different-looking URLs.
  return `https://www.reddit.com${url.pathname.replace(/\/+$/, "")}/`;
}
