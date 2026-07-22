// Orchestration layer — every function here takes its `provider` as a
// plain argument (dependency injection) rather than resolving one
// itself, so this file has zero knowledge of which concrete providers
// exist. Callers (the API routes) resolve a provider by name via
// lib/orders/registry.js and pass it in.
import { withRetry } from "./retry";

async function recordCompletionSnapshot({ admin, campaignId, providerName, delivered }) {
  const { data: lastSnapshot } = await admin
    .from("campaign_snapshots")
    .select("score")
    .eq("campaign_id", campaignId)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const baseScore = lastSnapshot?.score ?? 0;
  const { data, error } = await admin
    .from("campaign_snapshots")
    .insert({
      campaign_id: campaignId,
      score: baseScore + (Number(delivered) || 0),
      reply_count: null,
      removed: false,
      // Anything other than the shipped 'simulated' provider is tagged
      // 'provider' — keeps a future real integration's results visually
      // distinct from the demo one everywhere they're displayed.
      source: providerName === "simulated" ? "simulated" : "provider",
    })
    .select("id, score, reply_count, removed, source, checked_at")
    .single();
  if (error) throw error;
  return data;
}

// Submits a new order through `provider` and persists it. Retries a
// transient submit failure; a persistent one propagates so the caller's
// credit charge gets auto-refunded (see lib/credits.js's withCredits).
export async function submitOrder({ admin, campaign, provider, quantity }) {
  const submission = await withRetry(() =>
    provider.submitOrder({ campaignId: campaign.id, targetUrl: campaign.target_url, quantity })
  );

  const { data, error } = await admin
    .from("campaign_orders")
    .insert({
      campaign_id: campaign.id,
      provider: provider.name,
      provider_order_id: submission.providerOrderId,
      quantity,
      status: submission.status,
      metadata: submission.metadata ?? null,
      result: submission.result ?? null,
      submitted_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// Applies a status result (from either a poll or a verified webhook
// event) to an order row, and — only on a fresh transition to
// 'completed' — records a snapshot so the campaign's chart reflects it.
// Returns { order, snapshot }; snapshot is null unless this call is the
// one that just completed the order.
export async function applyOrderUpdate({ admin, order, statusResult }) {
  const nowIso = new Date().toISOString();
  const updates = {
    status: statusResult.status,
    metadata: statusResult.metadata ?? order.metadata,
    result: statusResult.result ?? order.result,
    error: statusResult.error || null,
    last_polled_at: nowIso,
  };
  if (statusResult.status === "completed") updates.completed_at = nowIso;

  const { data, error } = await admin
    .from("campaign_orders")
    .update(updates)
    .eq("id", order.id)
    .select("*")
    .single();
  if (error) throw error;

  let snapshot = null;
  if (statusResult.status === "completed" && order.status !== "completed") {
    snapshot = await recordCompletionSnapshot({
      admin,
      campaignId: order.campaign_id,
      providerName: order.provider,
      delivered: data.result?.delivered ?? data.quantity,
    });
  }

  return { order: data, snapshot };
}

// On-demand poll (no cron in this app — same convention as Campaigns'
// "Check now" and Track Tasks' "Refresh stats"). A terminal order is a
// no-op: nothing left to learn from re-polling a finished order. Returns
// { order, snapshot } — see applyOrderUpdate.
export async function pollOrder({ admin, order, provider }) {
  if (order.status === "completed" || order.status === "failed") {
    return { order, snapshot: null };
  }

  let statusResult;
  try {
    statusResult = await withRetry(
      () => provider.pollStatus({ providerOrderId: order.provider_order_id, metadata: order.metadata }),
      { retries: 2 }
    );
  } catch (e) {
    const { data } = await admin
      .from("campaign_orders")
      .update({ status: "failed", error: e?.message || "Poll failed.", last_polled_at: new Date().toISOString() })
      .eq("id", order.id)
      .select("*")
      .single();
    return { order: data, snapshot: null };
  }

  return applyOrderUpdate({ admin, order, statusResult });
}
