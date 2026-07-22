import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchItemStats } from "@/lib/reddit";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

// The ONLY thing that ever reports real progress for a campaign — a real
// Apify-backed re-fetch of the actual Reddit post (same mechanism as
// report_drafts' refresh-stats route). Recorded as its own snapshot row
// (source: 'real') rather than overwriting a single cached value, so the
// campaign's chart shows genuine change over time, not just "now".
export async function POST(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, target_url")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "campaign_check",
    amount: CREDIT_COSTS.campaign_check,
    description: "Checked live campaign stats",
    metadata: { campaignId: campaign.id },
    run: () => fetchItemStats(campaign.target_url),
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json(
      { error: "Couldn't check that link right now. Try again." },
      { status: 502 }
    );
  }

  const stats = outcome.result;
  const { data: snapshot, error: insertError } = await admin
    .from("campaign_snapshots")
    .insert({
      campaign_id: campaign.id,
      score: stats.score,
      reply_count: stats.replyCount,
      removed: stats.removed,
      source: "real",
    })
    .select("id, score, reply_count, removed, source, checked_at")
    .single();
  if (insertError) {
    console.error("[campaigns/check] snapshot insert failed:", insertError.message);
  }

  return NextResponse.json({ ok: true, snapshot, creditsRemaining: outcome.balance });
}
