import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshMentionsForBrand } from "@/lib/mentions";
import { runWithConcurrency } from "@/lib/concurrency";

export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH_SIZE = 15;
const CONCURRENCY = 5;

// Vercel Cron sends this exact header on every invocation when CRON_SECRET
// is set — see vercel.json's `crons` entry for this route's schedule.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Automated version of the manual "Refresh" button in
// app/dashboard/mentions (app/api/mentions/refresh/route.js) — same
// lib/mentions.js search+sentiment logic, run on a schedule across every
// active brand instead of waiting for a customer to click. Picks the
// most-overdue brands first (company_profiles.mentions_refreshed_at,
// nulls first) and caps the batch per invocation to stay inside Vercel's
// function timeout; the cron fires every few hours so the full brand
// list cycles through over the day. This is what makes "social
// listening" continuous instead of on-demand only.
export async function GET(req) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "trialing"]);
  const activeUserIds = [...new Set((subs || []).map((s) => s.user_id))];
  if (activeUserIds.length === 0) return NextResponse.json({ refreshed: 0 });

  const { data: brands, error } = await admin
    .from("company_profiles")
    .select("id, user_id, company_name, brand_variations, mentions_refreshed_at")
    .in("user_id", activeUserIds)
    .eq("completed", true)
    .not("company_name", "is", null)
    .order("mentions_refreshed_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error("[cron/refresh-mentions] query failed:", error.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  if (!brands || brands.length === 0) return NextResponse.json({ refreshed: 0 });

  let refreshed = 0;
  await runWithConcurrency(brands, CONCURRENCY, async (profile) => {
    const brand = (profile.company_name || "").trim();
    if (!brand) return;
    try {
      const variations = Array.isArray(profile.brand_variations) ? profile.brand_variations.filter(Boolean) : [];
      await refreshMentionsForBrand(admin, {
        userId: profile.user_id,
        companyProfileId: profile.id,
        brand,
        variations,
      });
      refreshed++;
    } catch (e) {
      console.error("[cron/refresh-mentions] brand failed:", profile.id, e?.message || e);
    } finally {
      // Stamped even on failure — otherwise a brand whose search keeps
      // erroring would sort first forever and starve every other brand.
      await admin.from("company_profiles").update({ mentions_refreshed_at: new Date().toISOString() }).eq("id", profile.id);
    }
  });

  return NextResponse.json({ refreshed, candidates: brands.length });
}
