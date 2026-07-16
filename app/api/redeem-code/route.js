import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasActiveSubscription } from "@/lib/subscription";
import { grantCredits } from "@/lib/credits";

export const runtime = "nodejs";

export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const code = String(body?.code || "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Enter a code." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const { data: redeemCode } = await admin
    .from("redeem_codes")
    .select("code, plan, max_uses, uses_count, expires_at, credits")
    .eq("code", code)
    .maybeSingle();

  if (!redeemCode) {
    return NextResponse.json({ error: "Invalid code." }, { status: 404 });
  }
  if (redeemCode.expires_at && new Date(redeemCode.expires_at) < new Date()) {
    return NextResponse.json({ error: "This code has expired." }, { status: 400 });
  }
  if (redeemCode.max_uses != null && redeemCode.uses_count >= redeemCode.max_uses) {
    return NextResponse.json({ error: "This code has already been fully redeemed." }, { status: 400 });
  }

  // Plan-granting is skipped for users who already have an active plan (a
  // code can't downgrade/replace an existing subscription), but bonus
  // credits still apply regardless — the two are independent grants, so an
  // early return here would silently swallow the credits half of a code
  // that carries both.
  const alreadySubscribed = await hasActiveSubscription(supabase, user.id);
  if (!alreadySubscribed) {
    const { error: insertError } = await admin.from("subscriptions").insert({
      user_id: user.id,
      stripe_customer_id: "comp",
      stripe_subscription_id: `comp_${code}_${user.id}`,
      plan: redeemCode.plan || "comp",
      status: "active",
    });
    if (insertError) {
      console.error("[redeem-code] insert failed:", insertError.message);
      return NextResponse.json({ error: "Could not redeem code." }, { status: 500 });
    }
  }

  if (redeemCode.credits) {
    await grantCredits(admin, user.id, redeemCode.credits, "redeem_code", `Redeemed code ${code}`, { code });
  }

  await admin
    .from("redeem_codes")
    .update({ uses_count: redeemCode.uses_count + 1 })
    .eq("code", code);

  return NextResponse.json({
    ok: true,
    message: alreadySubscribed ? "You already have an active plan." : undefined,
  });
}
