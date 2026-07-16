import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  const subreddit = String(body?.subreddit || "").trim().slice(0, 80);
  const title = String(body?.title || "").trim().slice(0, 200);
  const bodyText = String(body?.body || "").trim().slice(0, 2000);

  if (!subreddit || !bodyText) {
    return NextResponse.json({ error: "Subreddit and content are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("report_drafts")
    .insert({
      user_id: user.id,
      report_id: null,
      subreddit,
      title: title || subreddit,
      body: bodyText,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[drafts] create failed:", error.message);
    return NextResponse.json({ error: "Could not save draft." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
