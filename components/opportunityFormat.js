// Shared labels for the Opportunities list and detail pane. Score
// thresholds match components/ScoreBadge.js and the dashboard.

export function scoreTier(score) {
  if (score == null) return { cls: "is-none", label: "Not scored" };
  if (score >= 85) return { cls: "is-high", label: "Excellent match" };
  if (score >= 60) return { cls: "is-mid", label: "Good match" };
  return { cls: "is-low", label: "Weak match" };
}

export function intentLabel(intent) {
  if (intent === "high") return { cls: "is-high", label: "High intent" };
  if (intent === "medium") return { cls: "is-mid", label: "Medium intent" };
  if (intent === "low") return { cls: "is-low", label: "Low intent" };
  return null;
}

// Post text from Reddit arrives HTML-escaped ("I&#39;ve", "&amp;").
function decodeEntities(s) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, k) => named[k]);
}

// Threads found through web search before the lib/reddit.js fix stored the
// page's raw text: "Title: <title> : r/sub", a "# <title>" heading and
// Reddit's "Skip to main content" chrome. Strip all of that; return "" when
// nothing beyond the title is left, so no empty or repeated quote shows.
export function cleanPostText(text, title = "") {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let t = decodeEntities(String(text || ""))
    // Reddit's feed format ends posts with "submitted by /u/x [link] [comments]".
    .replace(/\s*submitted by\s+\/?u\/\S+[\s\S]*$/i, "")
    .replace(/^Title:.*$/gim, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/Skip to main content/gi, " ")
    .replace(/\s*Skip to( main( con\w*)?)?\s*$/i, "") // cut off at 130 chars
    .replace(/\s+/g, " ")
    .trim();
  const head = String(title || "").trim();
  // Drop the title and the "r/sub" label wherever the text repeats them,
  // comparing letters and digits only, so "(I will not promote)" matches
  // "I will not promote.".
  const nh = norm(head);
  for (let i = 0; i < 4; i++) {
    const before = t;
    if (nh && norm(t).startsWith(nh)) {
      let seen = 0, cut = 0;
      while (cut < t.length && seen < nh.length) if (/[a-z0-9]/i.test(t[cut++])) seen++;
      t = t.slice(cut);
    }
    t = t.replace(/^[\s).?!:,|-]+/, "").replace(/^r\/[\w-]+\.?/i, "").replace(/^[\s).?!:,|-]+/, "").trim();
    if (t === before) break;
  }
  if (t.length < 25 || norm(head).startsWith(norm(t))) return "";
  return t;
}

export function ago(date) {
  const t = typeof date === "number" ? date : Date.parse(date);
  if (!t) return "";
  const min = Math.max(1, Math.floor((Date.now() - t) / 60000));
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const d = Math.floor(hr / 24);
  if (d < 60) return `${d} day${d > 1 ? "s" : ""} ago`;
  return `${Math.floor(d / 30)} months ago`;
}
