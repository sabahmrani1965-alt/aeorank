import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRedditContent, isLlmConfigured } from "@/lib/llm";

export const runtime = "nodejs";

// Generating a preview is free — credits are only spent once the result is
// actually saved (see app/api/drafts/route.js), so regenerating/tweaking
// before committing doesn't cost anything.
export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: "AI generation isn't configured." }, { status: 500 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}

  const { data: profile } = await supabase
    .from("company_profiles")
    .select("company_name, description")
    .eq("user_id", user.id)
    .maybeSingle();

  const result = await generateRedditContent({
    type: body.type,
    subreddit: body.subreddit,
    threadContext: body.threadContext,
    tone: body.tone,
    length: body.length,
    brand: profile?.company_name || "",
    description: profile?.description || "",
    existingText: body.existingText || "",
  });

  if (!result) {
    return NextResponse.json({ error: "Could not generate content. Try again." }, { status: 500 });
  }

  return NextResponse.json(result);
}
