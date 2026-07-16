// Centralized credit service — every AI-costing route goes through this,
// not through hand-rolled balance checks. Mutations always go through the
// deduct_credits/grant_credits Postgres functions (atomic, service-role
// only) rather than a read-then-write in JS, which would race under
// concurrent requests.

export const CREDIT_COSTS = {
  generate_comment: 1,
  generate_reply: 1,
  generate_post: 2,
  rewrite_draft: 1,
  opportunity_analysis: 1,
  mention_analysis: 1,
  ai_visibility_report: 10,
  competitor_analysis: 8,
  brand_sentiment_report: 5,
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
  rewrite_draft: "Rewrote draft",
  opportunity_analysis: "Opportunity analysis",
  mention_analysis: "Mention analysis",
  ai_visibility_report: "AI visibility report",
  competitor_analysis: "Competitor analysis",
  brand_sentiment_report: "Brand sentiment report",
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

// Coarse category for the history table's "Type" column.
export function transactionType(action) {
  if (action === "purchase") return "Purchase";
  if (action === "monthly_renewal") return "Renewal";
  if (action === "refund") return "Refund";
  if (action === "admin_grant" || action === "redeem_code") return "Grant";
  if (action === "admin_remove") return "Removal";
  return "Usage";
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
