import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";

const TYPES = new Set(["comment", "post", "reply"]);

// Credits are charged here, on save — not on generate (see
// app/api/drafts/generate/route.js) — so regenerating/tweaking a preview
// is free and you only pay once you actually commit to keeping it.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const subreddit = String(body?.subreddit || "").trim().slice(0, 80);
  const title = String(body?.title || "").trim().slice(0, 200);
  const bodyText = String(body?.body || "").trim().slice(0, 2000);
  const type = TYPES.has(body?.type) ? body.type : null;

  if (!subreddit || !bodyText) {
    return NextResponse.json({ error: "Subreddit and content are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const action = type === "post" ? "generate_post" : type === "reply" ? "generate_reply" : "generate_comment";
  const amount = CREDIT_COSTS[action];

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action,
    amount,
    description: `Saved a ${type || "comment"} for ${subreddit}`,
    metadata: { subreddit, type },
    run: async () => {
      const { data, error } = await admin
        .from("report_drafts")
        .insert({ user_id: user.id, report_id: null, type, subreddit, title: title || subreddit, body: bodyText })
        .select("id")
        .single();
      if (error) {
        console.error("[drafts] create failed:", error.message);
        return null;
      }
      return data;
    },
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json(
        { error: `Not enough credits — saving this costs ${amount} credits.`, balance },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: "Could not save post." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: outcome.result.id,
    creditsCharged: amount,
    creditsRemaining: outcome.balance,
  });
}
