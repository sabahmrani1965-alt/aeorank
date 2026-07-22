import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";
import { normalizeRedditUrl } from "@/lib/format";
import { parseRedditUrl } from "@/lib/reddit";

export const runtime = "nodejs";

// Free to create — this just registers a URL to watch, it isn't AI
// generation (unlike the credit-costing actions in lib/credits.js).
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

  const rawUrl = String(body?.targetUrl || "").trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "Paste the Reddit post URL to track." }, { status: 400 });
  }
  const targetUrl = normalizeRedditUrl(rawUrl);
  if (!targetUrl) {
    return NextResponse.json(
      { error: "That doesn't look like a Reddit link. Paste the full URL of the post." },
      { status: 400 }
    );
  }
  const parsed = parseRedditUrl(targetUrl);
  const title = String(body?.title || "").trim().slice(0, 200) || null;

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      company_profile_id: profile?.id || null,
      target_url: targetUrl,
      subreddit: parsed?.sub || null,
      title,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[campaigns] create failed:", error.message);
    return NextResponse.json({ error: "Could not create campaign." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
