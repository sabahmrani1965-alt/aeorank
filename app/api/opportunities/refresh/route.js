import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchPosts } from "@/lib/reddit";
import { pickCategoryQuery } from "@/lib/keywords";
import { scoreOpportunities, isLlmConfigured } from "@/lib/llm";
import { hasActiveSubscription } from "@/lib/subscription";
import { hasCredits, deductCredits, refundCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

const SEARCH_LIMIT = 20;
const PER_ITEM_COST = CREDIT_COSTS.opportunity_analysis;

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!(await hasActiveSubscription(supabase, user.id))) {
    return NextResponse.json({ error: "This requires an active plan." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  // Reserve worst-case cost (a full batch) upfront — refunded down to the
  // actual count once we know how many posts were really scored. Avoids
  // running the search/LLM call at all if there's clearly not enough.
  const maxCost = SEARCH_LIMIT * PER_ITEM_COST;
  if (!(await hasCredits(supabase, user.id, maxCost))) {
    const { balance } = await getBalance(supabase, user.id);
    return NextResponse.json(
      { error: `This needs up to ${maxCost} credits (1 per opportunity found).`, balance },
      { status: 402 }
    );
  }

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("company_name, description, website")
    .eq("user_id", user.id)
    .maybeSingle();

  const description = profile?.description || "";
  const brand = profile?.company_name || "";
  if (!description && !brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know what to search for." },
      { status: 400 }
    );
  }

  const categoryQuery = pickCategoryQuery(description, brand);

  const reservation = await deductCredits(
    admin, user.id, maxCost, "opportunity_analysis",
    "Reserved for an opportunities refresh", { categoryQuery }
  );
  if (!reservation.ok) {
    return NextResponse.json({ error: "Not enough credits." }, { status: 402 });
  }

  try {
    const posts = await searchPosts(categoryQuery, SEARCH_LIMIT);
    const deduped = [...new Map(posts.map((p) => [p.permalink, p])).values()];

    if (deduped.length === 0) {
      await supabase.from("opportunities").delete().eq("user_id", user.id).eq("saved", false);
      await refundCredits(admin, user.id, maxCost, "refund", "No opportunities found", reservation.transactionId);
      return NextResponse.json({ ok: true, count: 0 });
    }

    const scores = isLlmConfigured()
      ? await scoreOpportunities(deduped, description || brand)
      : null;

    // Only charge for items that were actually scored — if scoring didn't
    // run at all, no "analysis" happened, so refund the full reservation.
    const actualCost = scores ? deduped.length * PER_ITEM_COST : 0;
    const refundAmount = maxCost - actualCost;
    if (refundAmount > 0) {
      await refundCredits(
        admin, user.id, refundAmount, "refund",
        `Reconciled: ${deduped.length} opportunities analyzed`, reservation.transactionId
      );
    }

    const rows = deduped.map((p, i) => ({
      user_id: user.id,
      sub: p.sub,
      title: p.title,
      snippet: p.snippet || null,
      permalink: p.permalink,
      ups: p.ups || 0,
      comments: p.comments || 0,
      post_created_at: p.created ? new Date(p.created).toISOString() : null,
      relevance_score: scores?.[i]?.score ?? null,
      relevance_reason: scores?.[i]?.reason || null,
      buying_intent: scores?.[i]?.buyingIntent ?? null,
    }));

    // Replace, not append — a refresh reflects the current search, not an
    // ever-growing history. Saved rows are pinned and skip this wipe.
    await supabase.from("opportunities").delete().eq("user_id", user.id).eq("saved", false);
    const { error: insertError } = await supabase.from("opportunities").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("[opportunities/refresh] failed:", e?.message || e);
    await refundCredits(admin, user.id, maxCost, "refund", "Refresh failed", reservation.transactionId);
    return NextResponse.json({ error: "Could not refresh opportunities." }, { status: 500 });
  }
}
