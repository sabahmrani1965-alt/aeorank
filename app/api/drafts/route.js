import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCompanyProfile } from "@/lib/brands";
import { withCredits, getBalance, CREDIT_COSTS, upvoteCreditCost } from "@/lib/credits";
import { needsTargetUrl, normalizeRedditUrl, normalizeSubredditInput } from "@/lib/format";
import { parseRedditUrl } from "@/lib/reddit";

export const runtime = "nodejs";

const TYPES = new Set(["comment", "post", "reply", "upvote"]);

// Upvoting has no written content — a fixed placeholder stands in for
// `body` so every downstream display path (Track Tasks snippet/search,
// the poster's DraftViewer "copy content") that assumes a meaningful
// `body` string keeps working without a special case for this type.
const UPVOTE_BODY = "Upvote this post.";

// One Reddit account can only upvote a given post once, so a real order
// needs multiple posters — each one fulfills exactly one upvote. Modeled
// as `qty` identical report_drafts rows (one per poster slot), which
// lib/posterTasks.js's getAvailableMissions() already groups into a single
// marketplace listing with "N/qty slots" via its existing
// (user_id, subreddit, type) grouping — no new mechanism needed.
const MIN_UPVOTE_QTY = 10;
const MAX_UPVOTE_QTY = 500;

// Credits are charged here, on save — not on generate (see
// app/api/drafts/generate/route.js) — so regenerating/tweaking a preview
// is free and you only pay once you actually commit to keeping it.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  let subreddit = String(body?.subreddit || "").trim().slice(0, 80);
  const title = String(body?.title || "").trim().slice(0, 200);
  const type = TYPES.has(body?.type) ? body.type : null;
  const bodyText = type === "upvote" ? UPVOTE_BODY : String(body?.body || "").trim().slice(0, 2000);

  // A comment/reply is aimed at a thread that already exists — without the
  // link the poster who claims this task has no way to find it. Validated
  // here and not just in the form, since this route is the only thing
  // standing between a request and the credit charge below. There's no
  // separate subreddit input for these types — the thread link IS where it
  // goes, so the subreddit is derived from it instead of asked twice.
  let targetUrl = null;
  if (needsTargetUrl(type)) {
    const rawTarget = String(body?.targetUrl || "").trim();
    if (!rawTarget) {
      return NextResponse.json(
        { error: "Link to the Reddit thread is required for a comment or reply." },
        { status: 400 }
      );
    }
    targetUrl = normalizeRedditUrl(rawTarget);
    if (!targetUrl) {
      return NextResponse.json(
        { error: "That doesn't look like a Reddit link. Paste the full URL of the thread." },
        { status: 400 }
      );
    }
    const parsed = parseRedditUrl(targetUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Could not determine the subreddit from that link." }, { status: 400 });
    }
    subreddit = parsed.sub;
  } else {
    // Free-text field, and nothing on the client stops someone from
    // pasting a full subreddit URL here instead of just its name — this
    // is the only thing standing between that and a broken
    // "r/https://reddit.com/r/..." row (see lib/format.js's
    // normalizeSubredditInput for what it catches).
    const clean = normalizeSubredditInput(subreddit);
    subreddit = clean ? `r/${clean}` : "";
  }

  if (!subreddit || !bodyText) {
    return NextResponse.json({ error: "Subreddit and content are required." }, { status: 400 });
  }

  let qty = 1;
  if (type === "upvote") {
    qty = parseInt(body?.qty, 10);
    if (!Number.isFinite(qty) || qty < MIN_UPVOTE_QTY) {
      return NextResponse.json(
        { error: `Minimum order is ${MIN_UPVOTE_QTY} upvotes.` },
        { status: 400 }
      );
    }
    qty = Math.min(qty, MAX_UPVOTE_QTY);
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: "Complete your company profile first." }, { status: 400 });
  }

  const action =
    type === "post" ? "generate_post" :
    type === "reply" ? "generate_reply" :
    type === "upvote" ? "generate_upvote" :
    "generate_comment";
  const amount = type === "upvote" ? upvoteCreditCost(qty) : CREDIT_COSTS[action] * qty;

  const outcome = await withCredits({
    admin,
    userId: user.id,
    action,
    amount,
    description: type === "upvote" ? `Ordered ${qty} upvotes for ${subreddit}` : `Saved a ${type || "comment"} for ${subreddit}`,
    metadata: { subreddit, type, qty },
    run: async () => {
      const rows = Array.from({ length: qty }, () => ({
        user_id: user.id,
        company_profile_id: profile.id,
        report_id: null,
        type,
        subreddit,
        title: title || subreddit,
        body: bodyText,
        target_url: targetUrl,
      }));
      const { data, error } = await admin.from("report_drafts").insert(rows).select("id");
      if (error) {
        console.error("[drafts] create failed:", error.message);
        return null;
      }
      return data;
    },
  });

  if (!outcome.ok) {
    if (outcome.error === "insufficient_credits") {
      const { balance } = await getBalance(supabase, user.id);
      return NextResponse.json(
        { error: `Not enough credits: saving this costs ${amount} credits.`, balance },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: "Could not save post." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: outcome.result[0].id,
    creditsCharged: amount,
    creditsRemaining: outcome.balance,
  });
}
