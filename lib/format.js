// Tiny, dependency-free display-formatting helpers — deliberately kept
// free of any Node-only APIs (unlike lib/reddit.js, which uses Buffer)
// so they're always safe to import from client components too.

// Extracts a bare subreddit name from arbitrary user input: "SaaS",
// "r/SaaS", or a pasted Reddit URL (subreddit page or thread link) all
// become "SaaS". Returns "" if nothing usable was found. Used to sanitize
// what actually gets saved for types with no target thread link — see
// app/api/drafts/route.js — where the Subreddit field is free text and
// nothing previously stopped someone from pasting a full URL into it.
export function normalizeSubredditInput(input) {
  const s = String(input || "").trim();
  if (!s) return "";
  if (/^(https?:\/\/)?(www\.)?(old\.)?reddit\.com\//i.test(s)) {
    try {
      const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
      const m = u.pathname.match(/^\/r\/([^/]+)/i);
      return m ? m[1] : "";
    } catch {
      return "";
    }
  }
  return s.replace(/^\/?r\//i, "").replace(/\/+$/, "");
}

// report_drafts.subreddit is stored WITH the "r/" prefix already (e.g.
// "r/SaaS" — see lib/reddit.js's mapRedditChildrenPost/mapApifyPost and
// parseRedditUrl, all of which produce that format). Display code should
// call this rather than assuming either convention, so a stray
// differently-formatted row never renders as "r/r/SaaS". Also runs the
// stripped value through normalizeSubredditInput so a row saved before
// that sanitization existed (e.g. "r/https://www.reddit.com/r/SaaS/",
// from a pasted URL nothing caught at save time) still displays as a
// clean name instead of the raw URL.
export function displaySubreddit(sub) {
  const stripped = String(sub || "").trim().replace(/^r\//i, "");
  return normalizeSubredditInput(stripped) || stripped;
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
