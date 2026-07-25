import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser } from "@/lib/posterTasks";
import { generateRedditContent, isLlmConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

// Regenerates the draft text for a task the poster currently holds — free
// (no credit charge; posters don't have a credit account), and refines
// rather than replaces (existingText passed to the LLM) so it stays on
// the same real topic/subreddit instead of drifting.
export async function POST(req, { params }) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: "AI writing isn't configured." }, { status: 500 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data: task } = await admin
    .from("report_drafts")
    .select("id, user_id, company_profile_id, type, subreddit, title, body")
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "claimed")
    .maybeSingle();
  if (!task) {
    return NextResponse.json({ error: "Task not found, expired, or not claimed by you." }, { status: 404 });
  }

  // The task's own brand, not re-derived from task.user_id — that customer
  // may have several brands now, so task.user_id alone no longer resolves
  // a single company_profiles row.
  const { data: profile } = task.company_profile_id
    ? await admin
        .from("company_profiles")
        .select("company_name, description")
        .eq("id", task.company_profile_id)
        .maybeSingle()
    : { data: null };

  const content = await generateRedditContent({
    type: task.type || "comment",
    subreddit: task.subreddit,
    brand: profile?.company_name || "",
    description: profile?.description || "",
    existingText: task.body,
  });
  if (!content) {
    return NextResponse.json({ error: "Could not generate new content. Try again." }, { status: 502 });
  }

  const newTitle = content.title || task.title;
  const { error } = await admin
    .from("report_drafts")
    .update({ title: newTitle, body: content.body })
    .eq("id", task.id);
  if (error) {
    return NextResponse.json({ error: "Could not save the new content." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, title: newTitle, body: content.body });
}
