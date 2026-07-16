import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRedditContent, isLlmConfigured } from "@/lib/llm";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";

export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: "AI generation isn't configured." }, { status: 500 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("company_name, description")
    .eq("user_id", user.id)
    .maybeSingle();

  const action = body.type === "post" ? "generate_post" : body.type === "reply" ? "generate_reply" : "generate_comment";
  const amount = CREDIT_COSTS[action];

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action,
    amount,
    description: `Generated a ${body.type || "comment"} draft for ${body.subreddit || "a subreddit"}`,
    metadata: { subreddit: body.subreddit, tone: body.tone, length: body.length },
    run: () =>
      generateRedditContent({
        type: body.type,
        subreddit: body.subreddit,
        threadContext: body.threadContext,
        tone: body.tone,
        length: body.length,
        brand: profile?.company_name || "",
        description: profile?.description || "",
        existingText: body.existingText || "",
      }),
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not generate content. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ...outcome.result, creditsRemaining: outcome.balance });
}
