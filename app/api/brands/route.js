import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listBrands, brandLimitForPlan } from "@/lib/brands";

export const runtime = "nodejs";

// Creates an additional brand (company_profiles row) for the caller,
// enforcing the plan's brand-count limit server-side (a client-side-only
// check would be bypassable). Reused by both "+ Add brand"
// (app/dashboard/brands/new) and app/onboarding/page.js's first-brand save.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);
  const sub = subs?.[0];
  const plan = sub && ["active", "trialing"].includes(sub.status) ? sub.plan : null;

  const existing = await listBrands(supabase, user.id);
  const limit = brandLimitForPlan(plan);
  if (existing.length >= limit) {
    return NextResponse.json(
      {
        error: `You've reached your plan's limit of ${limit} brand${limit === 1 ? "" : "s"}. Upgrade to add more.`,
        limit,
        count: existing.length,
      },
      { status: 403 }
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const { data: created, error } = await supabase
    .from("company_profiles")
    .insert({
      user_id: user.id,
      website: body.website || null,
      company_name: body.companyName || null,
      target_location: body.targetLocation || null,
      brand_variations: Array.isArray(body.brandVariations) ? body.brandVariations : [],
      description: body.description || null,
      competitors: Array.isArray(body.competitors) ? body.competitors.filter(Boolean) : [],
      completed: Boolean(body.completed ?? true),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[brands] create failed:", error.message);
    return NextResponse.json({ error: "Could not create this brand." }, { status: 500 });
  }

  await supabase.from("users").update({ active_company_profile_id: created.id }).eq("id", user.id);

  return NextResponse.json({ ok: true, id: created.id });
}
