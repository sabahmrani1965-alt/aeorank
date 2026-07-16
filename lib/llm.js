// Real LLM integration. Uses Anthropic Claude when ANTHROPIC_API_KEY is set.
// Designed to be cheap (small model, ~200 token cap) and to fail soft.

import Anthropic from "@anthropic-ai/sdk";

let _client = null;
function client() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export function isLlmConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM = `You are simulating how a popular AI chat assistant might answer a user's question for a brand-visibility audit.
Rules:
- Reply in 2-4 sentences, conversational tone, no markdown.
- If the brand fits naturally in the answer, mention it once. If it doesn't fit, mention it cautiously or note that you don't have specific information about it.
- Never fabricate features, customer counts, awards, prices, or testimonials.
- Never claim the brand is the best or recommend it over competitors.
- Stay neutral and informational.`;

async function ask(question, brand, description) {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 260,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Brand: ${brand}\nDescription: ${description || "(no description available)"}\n\nUser question: ${question}\n\nAnswer the user's question. If the brand fits the topic, mention it once naturally; otherwise omit it.`,
        },
      ],
    });
    const text = res?.content?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.error("[llm] error", e?.message || e);
    return null;
  }
}

// Build 2-3 brand-specific questions and ask them in parallel.
export async function generateBrandAnswers(brand, description, categoryQuery) {
  const topic = (categoryQuery || "this category").trim();
  const questions = [
    `What are some good options to consider in ${topic}?`,
    `Can you recommend platforms similar to ${brand}?`,
    `What do people online think about ${brand}?`,
  ];
  const [a, b, cAns] = await Promise.all(questions.map((q) => ask(q, brand, description)));
  return [
    { model: "gpt", question: questions[0], answer: a },
    { model: "claude", question: questions[1], answer: b },
    { model: "gemini", question: questions[2], answer: cAns },
  ].filter((x) => x.answer);
}

// Draft a single Reddit post suggestion — title + body tailored to one real
// subreddit already surfaced by the report. This is guidance only: the
// customer copies it and posts from their own account. Nothing here calls
// Reddit's API or publishes anything.
const POST_DRAFT_SYSTEM = `You draft a single Reddit post suggestion for a brand-visibility report.

Rules:
- Reply with ONLY a JSON object: {"title": "...", "body": "..."}, nothing else.
- Write as a founder/team member posting from their own account, not an ad.
- Match the tone of a genuine, helpful post to the given subreddit — no hype, no "check out our product" pitch as the opening line.
- title: under 100 characters, specific, not clickbait.
- body: 2-4 short sentences. Share real context or a useful angle related to the brand's category. Mention the brand once, naturally, not as a call to action.
- Never invent specific stats, customer counts, or claims you can't know are true.`;

export async function suggestRedditPost(brand, description, categoryQuery, subreddit) {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: POST_DRAFT_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Brand: ${brand}\nDescription: ${description || "(no description available)"}\nCategory: ${categoryQuery || "general"}\nTarget subreddit: ${subreddit || "r/SaaS"}\n\nDraft the post.`,
        },
      ],
    });
    const raw = res?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    let obj;
    try { obj = JSON.parse(match[0]); } catch { return null; }
    if (!obj.title || !obj.body) return null;
    return {
      subreddit: subreddit || "r/SaaS",
      title: String(obj.title).trim().slice(0, 140),
      body: String(obj.body).trim().slice(0, 600),
    };
  } catch (e) {
    console.error("[llm] post draft failed:", e?.message || e);
    return null;
  }
}

// Score a batch of real Reddit posts for how relevant they'd be for this
// company to engage with (reply/comment manually — nothing here posts
// anything). One batched call rather than one per post, same reasoning as
// extractCompetitors in lib/aivisibility.js.
const OPPORTUNITY_SYSTEM = `You score how relevant a list of real Reddit posts is for a specific company's manual engagement/marketing opportunities.

Rules — return ONLY a JSON array, same length and order as the input posts, nothing else:
- Each item: {"score": 0-100, "reason": "one short sentence"}.
- score reflects how good a fit the post is for this company to reply to with genuinely helpful, on-topic input (not how popular the post is).
- 90-100: the post is directly asking for what this company offers or a close alternative.
- 50-89: relevant category/audience, but not a direct ask.
- 0-49: tangential or off-topic — different audience or unrelated need.
- reason: cite what's actually in the post title/snippet, don't invent details.`;

export async function scoreOpportunities(posts, companyDescription) {
  const c = client();
  if (!c || !posts?.length) return null;
  try {
    const input = posts.map((p, i) => ({
      i,
      sub: p.sub,
      title: p.title,
      snippet: p.snippet || "",
    }));
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system: OPPORTUNITY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Company: ${companyDescription || "(no description available)"}\n\nPosts:\n${JSON.stringify(input)}\n\nScore each post. Return the JSON array only.`,
        },
      ],
    });
    const raw = res?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return null;
    let arr;
    try { arr = JSON.parse(match[0]); } catch { return null; }
    if (!Array.isArray(arr) || arr.length !== posts.length) return null;
    return arr.map((r) => ({
      score: Math.max(0, Math.min(100, Number(r?.score) || 0)),
      reason: String(r?.reason || "").slice(0, 200),
    }));
  } catch (e) {
    console.error("[llm] opportunity scoring failed:", e?.message || e);
    return null;
  }
}

// Classify sentiment for a batch of real Reddit posts/comments that already
// mention the brand. Read-only monitoring — nothing here posts anything.
const MENTION_SENTIMENT_SYSTEM = `You classify the sentiment of real Reddit posts/comments that mention a specific brand.

Rules — return ONLY a JSON array, same length and order as the input, nothing else:
- Each item: {"sentiment": "positive" | "neutral" | "negative", "reason": "one short sentence"}.
- Base the classification only on how the brand itself is discussed in the text, not the post's general topic.
- "positive": recommends, praises, or credits the brand.
- "negative": complains about, warns against, or criticizes the brand.
- "neutral": mentions it factually without a clear opinion either way.
- reason: cite what's actually in the text, don't invent details.`;

export async function scoreMentionSentiment(posts, brand) {
  const c = client();
  if (!c || !posts?.length) return null;
  try {
    const input = posts.map((p, i) => ({
      i,
      sub: p.sub,
      title: p.title,
      snippet: p.snippet || "",
    }));
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system: MENTION_SENTIMENT_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Brand: ${brand}\n\nPosts:\n${JSON.stringify(input)}\n\nClassify each. Return the JSON array only.`,
        },
      ],
    });
    const raw = res?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return null;
    let arr;
    try { arr = JSON.parse(match[0]); } catch { return null; }
    if (!Array.isArray(arr) || arr.length !== posts.length) return null;
    return arr.map((r) => ({
      sentiment: ["positive", "neutral", "negative"].includes(r?.sentiment) ? r.sentiment : "neutral",
      reason: String(r?.reason || "").slice(0, 200),
    }));
  } catch (e) {
    console.error("[llm] mention sentiment scoring failed:", e?.message || e);
    return null;
  }
}

// Draft composer content on demand — the manual "new draft" flow in the
// dashboard (as opposed to suggestRedditPost, which is auto-attached to a
// report). Same guidance-only contract: this only ever returns text for
// the customer to copy and post themselves, nothing here touches Reddit.
const LENGTH_GUIDE = {
  short: "1-2 short sentences.",
  medium: "3-5 sentences.",
  long: "a short paragraph (6-9 sentences).",
};

const CONTENT_SYSTEM = `You draft Reddit content (a comment, a reply, or a standalone post) for a brand's marketing team to review and post themselves from their own account.

Rules:
- Reply with ONLY a JSON object: {"title": "...", "body": "..."} — for a comment or reply, "title" should be an empty string.
- Write as a genuine person participating in the community, never as an ad. No "check out our product" as an opening line.
- Match the requested length exactly.
- Mention the brand at most once, naturally, only if it actually fits.
- Never invent specific stats, customer counts, testimonials, or claims that can't be verified.
- If asked to refine existing text, keep its core point and voice, don't replace it with something generic.`;

export async function generateRedditContent({
  type = "comment", // comment | reply | post
  subreddit = "",
  threadContext = "",
  tone = "helpful",
  length = "medium",
  brand = "",
  description = "",
  existingText = "",
}) {
  const c = client();
  if (!c) return null;
  try {
    const lengthGuide = LENGTH_GUIDE[length] || LENGTH_GUIDE.medium;
    const kindLabel = type === "post" ? "a standalone post (needs a title)" : type === "reply" ? "a reply to a specific comment" : "a comment on a thread";
    const userMsg = [
      `Content type: ${kindLabel}`,
      `Subreddit: ${subreddit || "r/SaaS"}`,
      `Tone: ${tone}`,
      `Length: ${lengthGuide}`,
      `Brand: ${brand || "(none given)"}`,
      `Brand description: ${description || "(none given)"}`,
      threadContext ? `What the thread/discussion is about: ${threadContext}` : "",
      existingText ? `Existing draft to refine rather than replace:\n${existingText}` : "",
      "\nWrite it now.",
    ].filter(Boolean).join("\n");

    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      system: CONTENT_SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    });
    const raw = res?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    let obj;
    try { obj = JSON.parse(match[0]); } catch { return null; }
    if (!obj.body) return null;
    return {
      title: String(obj.title || "").trim().slice(0, 140),
      body: String(obj.body).trim().slice(0, 800),
    };
  } catch (e) {
    console.error("[llm] draft content generation failed:", e?.message || e);
    return null;
  }
}

// Ask Claude to produce a list of realistic SEO keyword phrases for the brand.
// Returns an array of strings, or null on failure / when not configured.
const KEYWORDS_SYSTEM = `You are an SEO researcher generating ranking-keyword candidates for a brand-visibility report.

Rules — return ONLY a JSON array of lowercase strings, nothing else:
- Each phrase: 1-4 words, no punctuation, no #, no quotes around items.
- Focus on the actual product/service category the brand serves (e.g. "vacation rentals" for Airbnb, not "platform" or "tools").
- Include a healthy mix of head terms (1-2 words) and longer-tail queries (3-4 words).
- Avoid generic words like "platform", "service", "software", "company", "website" by themselves.
- Avoid the brand's own name as a keyword.
- Avoid suffixes like "free trial", "vs", "discount", "alternatives" unless those genuinely match this brand's category.
- No duplicates.`;

export async function generateKeywordsFromLlm(brand, description, n = 20) {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 700,
      system: KEYWORDS_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Brand: ${brand}\nDescription: ${description || "(no description)"}\n\nReturn exactly ${n} keyword phrases as a JSON array of strings. Just the array, no explanation.`,
        },
      ],
    });
    const text = res?.content?.[0]?.text?.trim() || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    let arr;
    try { arr = JSON.parse(match[0]); } catch { return null; }
    if (!Array.isArray(arr)) return null;
    const cleaned = arr
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase().replace(/^#/, "") : ""))
      .filter((s) => s.length >= 3 && s.length <= 40 && /[a-z]/.test(s))
      .filter((s, i, a) => a.indexOf(s) === i)
      .slice(0, n);
    return cleaned.length >= 5 ? cleaned : null;
  } catch (e) {
    console.error("[llm] keyword generation failed:", e?.message || e);
    return null;
  }
}
