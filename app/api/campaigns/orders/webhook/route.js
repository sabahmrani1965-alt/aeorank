import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, applyOrderUpdate } from "@/lib/orders";

export const runtime = "nodejs";

// Provider-agnostic webhook intake — this route has zero knowledge of any
// specific provider's payload shape. `provider.verifyWebhook(payload,
// headers)` owns authenticating the request (signature/shared-secret/
// whatever that provider uses) and translating its payload into
// { providerOrderId, status, result?, error? }; this route only persists
// whatever comes back. Providers that don't define verifyWebhook (the
// shipped 'simulated' one doesn't — it never pushes updates, only
// answers pollStatus()) 404 here; polling is the fallback either way.
export async function POST(req) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const providerName = req.nextUrl.searchParams.get("provider");
  if (!providerName) {
    return NextResponse.json({ error: "Missing ?provider= query param." }, { status: 400 });
  }

  let provider;
  try {
    provider = getProvider(providerName);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  if (typeof provider.verifyWebhook !== "function") {
    return NextResponse.json({ error: `Provider "${providerName}" does not support webhooks.` }, { status: 404 });
  }

  const payload = await req.json().catch(() => null);
  const headers = Object.fromEntries(req.headers.entries());

  let event;
  try {
    event = await provider.verifyWebhook(payload, headers);
  } catch {
    return NextResponse.json({ error: "Invalid webhook." }, { status: 401 });
  }
  if (!event?.providerOrderId) {
    return NextResponse.json({ error: "Invalid webhook." }, { status: 401 });
  }

  const { data: order } = await admin
    .from("campaign_orders")
    .select("*")
    .eq("provider", providerName)
    .eq("provider_order_id", event.providerOrderId)
    .maybeSingle();
  if (!order) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  await applyOrderUpdate({ admin, order, statusResult: event });
  return NextResponse.json({ ok: true });
}
