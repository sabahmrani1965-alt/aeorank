import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchThread, parseRedditUrl } from "@/lib/reddit";
import { analyzeThread, isLlmConfigured } from "@/lib/llm";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

// Analyzes an arbitrary Reddit URL a user pastes into Draft Studio — unlike
// app/api/opportunities/analyze/route.js, there's no existing DB row to
// read from or write back to; this is a means to drafting, not a durable
// artifact, so nothing here is persisted. Reuses the exact same
// fetchThread/analyzeThread capability and thread_analysis credit cost.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: "AI analysis isn't configured." }, { status: 500 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const url = String(body?.url || "").trim();
  const parsed = parseRedditUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: "That doesn't look like a Reddit thread URL." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("description, company_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const companyDescription = profile?.description || profile?.company_name || "";

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "thread_analysis",
    amount: CREDIT_COSTS.thread_analysis,
    description: `Analyzed a pasted thread in ${parsed.sub}`,
    metadata: { url: parsed.permalink },
    run: async () => {
      const thread = await fetchThread(parsed.permalink);
      if (!thread) return null;
      return analyzeThread({
        title: thread.title,
        selftext: thread.selftext,
        comments: thread.comments,
        companyDescription,
      });
    },
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json(
      { error: "Couldn't fetch or analyze that thread. It may have been removed or is temporarily unavailable." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sub: parsed.sub,
    analysis: outcome.result,
    creditsRemaining: outcome.balance,
  });
}
