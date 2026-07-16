import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isAdminEmail } from "@/lib/adminAuth";

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

  const { data: balanceRow } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <DashboardShell email={user.email} isAdmin={isAdminEmail(user.email)} creditBalance={balanceRow?.balance ?? 0}>
      {children}
    </DashboardShell>
  );
}
