import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, pollOrder } from "@/lib/orders";

export const runtime = "nodejs";

// Free — this is a status refresh, not new work (matches the "monitoring
// is free" precedent set by campaign creation itself). No cron in this
// app; polling is on-demand only, same convention as Campaigns' "Check
// now" and Track Tasks' "Refresh stats".
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

  const { data: order } = await admin
    .from("campaign_orders")
    .select("*")
    .eq("id", params.orderId)
    .eq("campaign_id", campaign.id)
    .maybeSingle();
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let provider;
  try {
    provider = getProvider(order.provider);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  try {
    const { order: updated, snapshot } = await pollOrder({ admin, order, provider });
    return NextResponse.json({ ok: true, order: updated, snapshot });
  } catch {
    return NextResponse.json({ error: "Could not check order status right now." }, { status: 502 });
  }
}
