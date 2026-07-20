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
