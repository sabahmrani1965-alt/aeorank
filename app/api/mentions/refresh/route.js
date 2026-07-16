import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchPosts } from "@/lib/reddit";
import { scoreMentionSentiment, isLlmConfigured } from "@/lib/llm";
import { hasActiveSubscription } from "@/lib/subscription";
import { hasCredits, deductCredits, refundCredits, getBalance, CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

const SEARCH_LIMIT = 20;
const PER_ITEM_COST = CREDIT_COSTS.mention_analysis;

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

  const maxCost = SEARCH_LIMIT * PER_ITEM_COST;
  if (!(await hasCredits(supabase, user.id, maxCost))) {
    const { balance } = await getBalance(supabase, user.id);
    return NextResponse.json(
      { error: `This needs up to ${maxCost} credits (1 per mention found).`, balance },
      { status: 402 }
    );
  }

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("company_name, website")
    .eq("user_id", user.id)
    .maybeSingle();

  const brand = profile?.company_name || "";
  if (!brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Onboarding) so we know what brand to search for." },
      { status: 400 }
    );
  }

  const reservation = await deductCredits(
    admin, user.id, maxCost, "mention_analysis",
    "Reserved for a mentions refresh", { brand }
  );
  if (!reservation.ok) {
    return NextResponse.json({ error: "Not enough credits." }, { status: 402 });
  }

  try {
    const posts = await searchPosts(brand, SEARCH_LIMIT);
    const deduped = [...new Map(posts.map((p) => [p.permalink, p])).values()];

    if (deduped.length === 0) {
      await supabase.from("mentions").delete().eq("user_id", user.id);
      await refundCredits(admin, user.id, maxCost, "refund", "No mentions found", reservation.transactionId);
      return NextResponse.json({ ok: true, count: 0 });
    }

    const sentiments = isLlmConfigured() ? await scoreMentionSentiment(deduped, brand) : null;

    const actualCost = sentiments ? deduped.length * PER_ITEM_COST : 0;
    const refundAmount = maxCost - actualCost;
    if (refundAmount > 0) {
      await refundCredits(
        admin, user.id, refundAmount, "refund",
        `Reconciled: ${deduped.length} mentions analyzed`, reservation.transactionId
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
      sentiment: sentiments?.[i]?.sentiment || null,
      sentiment_reason: sentiments?.[i]?.reason || null,
    }));

    await supabase.from("mentions").delete().eq("user_id", user.id);
    const { error: insertError } = await supabase.from("mentions").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("[mentions/refresh] failed:", e?.message || e);
    await refundCredits(admin, user.id, maxCost, "refund", "Refresh failed", reservation.transactionId);
    return NextResponse.json({ error: "Could not refresh mentions." }, { status: 500 });
  }
}
