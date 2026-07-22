import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";

// DEMO ONLY. Simulates the "automatic boost" flow end-to-end (a credit
// charge, a recorded snapshot, a chart tick) WITHOUT ever contacting
// Reddit or any vote-selling service — this app does not automate voting
// and does not integrate with third-party vote vendors. The fabricated
// bump is stored with source: 'simulated', which keeps it permanently and
// visibly distinguishable from a real app/api/campaigns/[id]/check
// reading everywhere it's displayed (list card, chart, history table).
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
    .select("id")
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

  const { data: lastSnapshot } = await admin
    .from("campaign_snapshots")
    .select("score")
    .eq("campaign_id", campaign.id)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const baseScore = lastSnapshot?.score ?? 0;
  const simulatedScore = baseScore + (3 + Math.floor(Math.random() * 10));

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "campaign_boost_demo",
    amount: CREDIT_COSTS.campaign_boost_demo,
    description: "Simulated campaign boost (demo)",
    metadata: { campaignId: campaign.id },
    run: async () => {
      const { data, error } = await admin
        .from("campaign_snapshots")
        .insert({
          campaign_id: campaign.id,
          score: simulatedScore,
          reply_count: null,
          removed: false,
          source: "simulated",
        })
        .select("id, score, reply_count, removed, source, checked_at")
        .single();
      if (error) {
        console.error("[campaigns/boost] snapshot insert failed:", error.message);
        return null;
      }
      return data;
    },
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not simulate boost." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, snapshot: outcome.result, creditsRemaining: outcome.balance });
}
