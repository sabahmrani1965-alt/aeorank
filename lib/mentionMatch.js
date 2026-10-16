// Whether a stored "mention" is really about the brand. Search providers
// rank by topic, so a post can come back without naming the brand at all
// (one SaaSOffers "mention" was about another product, and its sentiment
// explanation said "does not mention or evaluate SaaSOffers"). The text we
// keep is short, so a missing name alone isn't proof: a mention is dropped
// only when the name is absent AND the sentiment explanation says so.

export const NOT_ABOUT = /\b(does not|doesn'?t|do not|is not|isn'?t|not)\s+(mention|reference|discuss|evaluate|relate to|about)\b|\bno mention of\b|\bunrelated to\b/i;

const compact = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function brandNeedles(profile) {
  const host = String(profile?.website || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0];
  return [profile?.company_name, host, ...(profile?.brand_variations || [])]
    .map(compact)
    .filter((n) => n.length >= 3);
}

export function isRealMention(m, needles) {
  const text = compact(`${m.title} ${m.snippet || ""}`);
  if (needles.some((n) => text.includes(n))) return true;
  return !NOT_ABOUT.test(m.sentiment_reason || "");
}
