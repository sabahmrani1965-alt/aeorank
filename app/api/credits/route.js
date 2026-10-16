import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan } from "@/lib/subscription";
import { planItemCosts } from "@/lib/credits";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [{ data: balance }, { data: recent }] = await Promise.all([
    supabase
      .from("credit_balances")
      .select("balance, monthly_allowance, allowance_reset_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("id, amount, action, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const plan = await getActivePlan(supabase, user.id);

  return NextResponse.json({
    plan,
    // Credits per ordered comment / reply / post on this plan.
    prices: planItemCosts(plan),
    balance: balance?.balance ?? 0,
    monthlyAllowance: balance?.monthly_allowance ?? 0,
    allowanceResetAt: balance?.allowance_reset_at ?? null,
    recent: recent || [],
  });
}
