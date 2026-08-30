import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAdminEmail } from "@/lib/adminAuth";
import { getActiveCompanyProfile, listBrands, brandLimitForPlan } from "@/lib/brands";

// Defense in depth on top of middleware.js — never renders dashboard
// content for a logged-out visitor even if the middleware matcher drifts.
export default async function DashboardLayout({ children }) {
  // No Supabase project configured yet — redirect home instead of every
  // /dashboard/** route throwing a raw 500.
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: balanceRow }, activeProfile, brands, { data: subs }] = await Promise.all([
    supabase.from("credit_balances").select("balance").eq("user_id", user.id).maybeSingle(),
    getActiveCompanyProfile(supabase, user.id),
    listBrands(supabase, user.id),
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const sub = subs?.[0] || null;
  const plan = sub && ["active", "trialing"].includes(sub.status) ? sub.plan : null;

  return (
    <DashboardShell
      email={user.email}
      isAdmin={isAdminEmail(user.email)}
      creditBalance={balanceRow?.balance ?? 0}
      project={{ name: activeProfile?.company_name || "", website: activeProfile?.website || "", logo: activeProfile?.logo_url || "" }}
      plan={plan}
      brands={brands}
      activeBrandId={activeProfile?.id || null}
      brandLimit={{ count: brands.length, limit: brandLimitForPlan(plan) }}
    >
      {children}
    </DashboardShell>
  );
}
