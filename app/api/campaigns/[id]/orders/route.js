import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";
import { getProvider, defaultProviderName, submitOrder } from "@/lib/orders";

export const runtime = "nodejs";

const MAX_QUANTITY = 1000;

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

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const quantity = Math.max(1, Math.min(MAX_QUANTITY, parseInt(body?.quantity, 10) || 1));
  const providerName = String(body?.provider || defaultProviderName());

  let provider;
  try {
    provider = getProvider(providerName);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action: "campaign_order",
    amount: CREDIT_COSTS.campaign_order * quantity,
    description: `Submitted a "${providerName}" order (x${quantity})`,
    metadata: { campaignId: campaign.id, provider: providerName, quantity },
    run: () => submitOrder({ admin, campaign, provider, quantity }),
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json({ error: "Not enough credits.", balance }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not submit order. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, order: outcome.result, creditsRemaining: outcome.balance });
}
