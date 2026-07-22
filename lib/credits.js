// Centralized credit service — every AI-costing route goes through this,
// not through hand-rolled balance checks. Mutations always go through the
// deduct_credits/grant_credits Postgres functions (atomic, service-role
// only) rather than a read-then-write in JS, which would race under
// concurrent requests.

// Comment/Reply = 5 credits, Post = 10 credits — charged when the result
// is saved (see app/api/drafts/route.js), not when it's generated.
export const CREDIT_COSTS = {
  generate_comment: 5,
  generate_reply: 5,
  generate_post: 10,
  generate_upvote: 1,
  rewrite_draft: 1,
  opportunity_analysis: 1,
  mention_analysis: 1,
  thread_analysis: 2,
  ai_visibility_report: 10,
  competitor_analysis: 8,
  brand_sentiment_report: 5,
  prompt_check: 3,
  refresh_reddit_stats: 2,
  campaign_check: 2,
  campaign_order: 1,
};

// Monthly credit grant per subscription plan. Plans themselves are code-
// defined (lib/stripe.js PLANS), not DB-driven, so this follows the same
// convention rather than a DB table.
export const PLAN_MONTHLY_CREDITS = {
  starter: 100,
  growth: 300,
  scale: 1000,
  comp: 50,
};

// Human-readable label for a transaction's `action` column — shared by the
// dashboard and admin history tables so both render the same wording.
const ACTION_LABELS = {
  generate_comment: "Generated comment",
  generate_reply: "Generated reply",
  generate_post: "Generated post",
  generate_upvote: "Ordered upvote",
  rewrite_draft: "Rewrote draft",
  opportunity_analysis: "Opportunity analysis",
  thread_analysis: "Thread analysis",
  mention_analysis: "Mention analysis",
  ai_visibility_report: "AI visibility report",
  competitor_analysis: "Competitor analysis",
  brand_sentiment_report: "Brand sentiment report",
  prompt_check: "Prompt check",
  refresh_reddit_stats: "Refreshed live stats",
  campaign_check: "Checked campaign stats",
  campaign_order: "Placed campaign order",
  monthly_renewal: "Monthly plan credits",
  purchase: "Credit pack purchase",
  admin_grant: "Granted by admin",
  admin_remove: "Removed by admin",
  refund: "Refund",
  redeem_code: "Redeem code",
};

export function actionLabel(action) {
  return ACTION_LABELS[action] || action;
}

// Single source of truth for the history table's "Type" column AND the
// Credits Center's type filter/export — every action belongs to exactly
// one group. "usage" is every real credit-costing action (CREDIT_COSTS'
// keys), so it can't drift out of sync as new AI actions are added.
export const ACTION_GROUPS = {
  usage: Object.keys(CREDIT_COSTS),
  purchase: ["purchase"],
  renewal: ["monthly_renewal"],
  refund: ["refund"],
  grant: ["admin_grant", "redeem_code"],
  removal: ["admin_remove"],
};

const ACTION_TO_GROUP = Object.fromEntries(
  Object.entries(ACTION_GROUPS).flatMap(([group, actions]) => actions.map((a) => [a, group]))
);

const GROUP_LABELS = {
  usage: "Usage",
  purchase: "Purchase",
  renewal: "Renewal",
  refund: "Refund",
  grant: "Grant",
  removal: "Removal",
};

// Coarse category for the history table's "Type" column.
export function transactionType(action) {
  return GROUP_LABELS[ACTION_TO_GROUP[action]] || "Usage";
}

// Shared filter-building for the history page and the CSV export route —
// returns an unresolved query builder so callers can still add .range()
// (pagination) or not (export-everything-matching).
export function buildTransactionQuery(supabase, userId, { q, type, from, to } = {}) {
  let query = supabase
    .from("credit_transactions")
    .select("id, amount, action, description, created_at", { count: "exact" })
    .eq("user_id", userId);

  if (q) {
    const like = `%${q.replace(/[%_]/g, "\\$&")}%`;
    query = query.or(`description.ilike.${like},action.ilike.${like}`);
  }
  if (type && ACTION_GROUPS[type]) {
    query = query.in("action", ACTION_GROUPS[type]);
  }
  if (from) query = query.gte("created_at", new Date(from).toISOString());
  if (to) {
    const end = new Date(to);
    end.setDate(end.getDate() + 1); // inclusive of the whole "to" day
    query = query.lt("created_at", end.toISOString());
  }

  return query.order("created_at", { ascending: false });
}

export async function getBalance(supabase, userId) {
  const { data } = await supabase
    .from("credit_balances")
    .select("balance, monthly_allowance, allowance_reset_at")
    .eq("user_id", userId)
    .maybeSingle();
  return data || { balance: 0, monthly_allowance: 0, allowance_reset_at: null };
}

export async function hasCredits(supabase, userId, amount) {
  const { balance } = await getBalance(supabase, userId);
  return balance >= amount;
}

// admin = the service-role client from lib/supabase/admin.js — these
// functions bypass RLS by design (balance mutation isn't a user-writable
// operation) and must never be called with the user's own session client.
export async function deductCredits(admin, userId, amount, action, description, metadata = null) {
  const { data: newBalance, error: rpcError } = await admin.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (rpcError) {
    console.error("[credits] deduct RPC failed:", rpcError.message);
    return { ok: false, error: "rpc_failed" };
  }
  if (newBalance == null) {
    return { ok: false, error: "insufficient_credits" };
  }
  const { data: txn, error: insertError } = await admin
    .from("credit_transactions")
    .insert({ user_id: userId, amount: -amount, action, description, metadata })
    .select("id")
    .single();
  if (insertError) {
    console.error("[credits] transaction log failed:", insertError.message);
  }
  return { ok: true, balance: newBalance, transactionId: txn?.id || null };
}

export async function grantCredits(admin, userId, amount, action, description, metadata = null) {
  const { data: newBalance, error: rpcError } = await admin.rpc("grant_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (rpcError) {
    console.error("[credits] grant RPC failed:", rpcError.message);
    return { ok: false, error: "rpc_failed" };
  }
  await admin.from("credit_transactions").insert({ user_id: userId, amount, action, description, metadata });
  return { ok: true, balance: newBalance };
}

export async function refundCredits(admin, userId, amount, action, description, refundOfTransactionId = null) {
  return grantCredits(admin, userId, amount, action, description, {
    refund_of: refundOfTransactionId,
  });
}

// The reusable "middleware": deducts before running, auto-refunds if
// `run()` throws or comes back empty. Every AI route should call this
// instead of writing its own check/deduct/log sequence.
export async function withCredits({ admin, userId, action, amount, description, metadata, run }) {
  const deduction = await deductCredits(admin, userId, amount, action, description, metadata);
  if (!deduction.ok) return deduction;

  try {
    const result = await run();
    if (!result) {
      await refundCredits(
        admin, userId, amount, "refund",
        `Auto-refund: ${action} returned no result`,
        deduction.transactionId
      );
      return { ok: false, error: "generation_failed" };
    }
    return { ok: true, result, balance: deduction.balance };
  } catch (e) {
    await refundCredits(
      admin, userId, amount, "refund",
      `Auto-refund: ${action} threw (${e?.message || e})`,
      deduction.transactionId
    );
    throw e;
  }
}
