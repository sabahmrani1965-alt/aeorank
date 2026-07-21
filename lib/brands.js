// Multi-brand ("company profile") resolution + plan-tier brand-count
// limits. Mirrors lib/credits.js's PLAN_MONTHLY_CREDITS convention: a
// code-defined constant keyed by the same starter/growth/scale plan
// identifiers as lib/stripe.js's PLANS, living in this feature's own file
// rather than centralized into lib/stripe.js.
export const BRAND_LIMITS = {
  none: 1,
  starter: 3,
  growth: 6,
  scale: 10,
  comp: 3,
};

export function brandLimitForPlan(plan) {
  return BRAND_LIMITS[plan || "none"] ?? BRAND_LIMITS.none;
}

// All of a user's brands, oldest first.
export async function listBrands(supabase, userId) {
  const { data, error } = await supabase
    .from("company_profiles")
    .select("id, company_name, website, completed, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Resolves the user's active brand: reads users.active_company_profile_id,
// re-validates it still belongs to this user and still exists, falls back
// to the user's oldest brand if unset/invalid/stale (self-healing the
// pointer when it changes), and returns null for a user with zero brands.
export async function getActiveCompanyProfile(supabase, userId) {
  const { data: userRow } = await supabase
    .from("users")
    .select("active_company_profile_id")
    .eq("id", userId)
    .maybeSingle();
  const activeId = userRow?.active_company_profile_id || null;

  if (activeId) {
    const { data: active } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("id", activeId)
      .eq("user_id", userId)
      .maybeSingle();
    if (active) return active;
  }

  const { data: fallback } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fallback && fallback.id !== activeId) {
    // Best-effort self-heal — a failure here just repeats this same
    // fallback lookup next time, not a functional problem.
    await supabase.from("users").update({ active_company_profile_id: fallback.id }).eq("id", userId);
  }
  return fallback || null;
}
