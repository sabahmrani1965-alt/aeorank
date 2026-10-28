import { NextResponse } from "next/server";
import {
  ToolError,
  brandMentions,
  cleanBrand,
  cleanTopic,
  findSubreddits,
  ipHashFrom,
  normalizeSubreddit,
  subredditRules,
  subredditTiming,
  withVisitor,
} from "@/lib/redditTools";

export const runtime = "nodejs";
export const maxDuration = 60;

const BAD_SUB = "Enter a subreddit name, like r/SaaS.";

// One endpoint for the free Reddit tools: /api/tools/reddit/<tool>?q=…
// Inputs are normalised before they reach the cache, so "r/SaaS" and
// "saas" share one cached result.
const TOOLS = {
  "subreddit-finder": (q) => {
    const topic = cleanTopic(q).toLowerCase();
    if (topic.length < 2) throw new ToolError("Enter a topic, like project management or email marketing.");
    return findSubreddits(topic);
  },
  "best-time-to-post": (q) => {
    const sub = normalizeSubreddit(q);
    if (!sub) throw new ToolError(BAD_SUB);
    return subredditTiming(sub.toLowerCase());
  },
  "brand-mentions": (q) => {
    const brand = cleanBrand(q).toLowerCase();
    if (brand.length < 2) throw new ToolError("Enter a brand or product name.");
    return brandMentions(brand);
  },
  "subreddit-rules": (q) => {
    const sub = normalizeSubreddit(q);
    if (!sub) throw new ToolError(BAD_SUB);
    return subredditRules(sub.toLowerCase());
  },
};

export async function GET(req, { params }) {
  const run = TOOLS[params.tool];
  if (!run) return NextResponse.json({ ok: false, error: "Unknown tool." }, { status: 404 });
  const q = new URL(req.url).searchParams.get("q") || "";
  try {
    const data = await withVisitor(ipHashFrom(req), () => run(q));
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    if (e instanceof ToolError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    console.error(`[tools/${params.tool}] failed:`, e?.message || e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
