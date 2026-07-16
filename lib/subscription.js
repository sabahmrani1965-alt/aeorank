// Shared "does this user have access" check. A row with status 'active'
// or 'trialing' counts, regardless of whether it's a real Stripe plan or a
// 'comp' plan granted via a redeem code — same table, same shape.
export async function hasActiveSubscription(supabase, userId) {
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
