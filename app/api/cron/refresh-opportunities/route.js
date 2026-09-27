import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshOpportunitiesForBrand } from "@/lib/opportunities";
import { runWithConcurrency } from "@/lib/concurrency";

export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH_SIZE = 10;
const CONCURRENCY = 3;
const MAX_QUERIES = 8;

// Automated version of the manual "Refresh" button in app/dashboard
// (app/api/opportunities/refresh/route.js), the same
// refreshOpportunitiesForBrand logic run on a schedule.
//
// Why this exists: every other continuous surface had a cron —
// check-prompts, refresh-mentions — but Opportunity discovery only ran
// when a customer clicked. Nobody clicked, so the queue aged: 80 threads
// scoring 70+ with a median age of 56 days, only 2 of them under a
// fortnight old. A two-month-old thread is a finished conversation, so a
// stale queue is not a smaller version of a fresh one, it is worthless.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

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
    .select("id, user_id, company_name, description")
    .in("user_id", activeUserIds)
    .eq("completed", true)
    .not("company_name", "is", null);

  if (error) {
    console.error("[cron/refresh-opportunities] query failed:", error.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  if (!brands || brands.length === 0) return NextResponse.json({ refreshed: 0 });

  // Most-overdue-first, the same rotation refresh-mentions uses — except
  // it sorts on company_profiles.mentions_refreshed_at and there is no
  // equivalent column for opportunities. Rather than require a migration,
  // staleness is derived from the newest opportunity each brand already
  // has. A brand with none sorts first, which is the behaviour we want.
  const { data: latest } = await admin
    .from("opportunities")
    .select("company_profile_id, fetched_at")
    .in("company_profile_id", brands.map((b) => b.id))
    .order("fetched_at", { ascending: false });

  const newestByProfile = new Map();
  for (const row of latest || []) {
    if (!newestByProfile.has(row.company_profile_id)) {
      newestByProfile.set(row.company_profile_id, row.fetched_at);
    }
  }
  const queue = [...brands]
    .sort((a, b) => {
      const av = newestByProfile.get(a.id) || "";
      const bv = newestByProfile.get(b.id) || "";
      return av.localeCompare(bv);
    })
    .slice(0, BATCH_SIZE);

  let refreshed = 0;
  let added = 0;
  await runWithConcurrency(queue, CONCURRENCY, async (profile) => {
    const brand = (profile.company_name || "").trim();
    if (!brand) return;
    try {
      // Tracked keywords steer discovery toward what the customer knows
      // their buyers search for, the same precedence the manual route
      // applies.
      const { data: keywordRows } = await admin
        .from("tracked_keywords")
        .select("keyword")
        .eq("user_id", profile.user_id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(MAX_QUERIES);

      const result = await refreshOpportunitiesForBrand(admin, {
        userId: profile.user_id,
        companyProfileId: profile.id,
        brand,
        description: profile.description || "",
        trackedKeywords: (keywordRows || []).map((k) => k.keyword),
      });
      added += result?.added ?? 0;
      refreshed++;
    } catch (e) {
      console.error("[cron/refresh-opportunities] brand failed:", profile.id, e?.message || e);
    }
  });

  return NextResponse.json({ refreshed, added, candidates: queue.length });
}
