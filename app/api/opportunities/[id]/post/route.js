import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchThread } from "@/lib/reddit";

export const runtime = "nodejs";
// Apify's thread fetch takes 10-25s; same 30s ceiling as the analyze route.
export const maxDuration = 30;

// The original post, for the Opportunities detail pane. Most threads are
// found through search, which stores only a one-line snippet, so the full
// text is fetched the first time a thread is opened and kept on the row
// (the same thread_selftext / thread_comments columns thread analysis
// fills). Free to the user: no credits, and one Apify run per thread.
export async function POST(_req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: o } = await supabase
    .from("opportunities")
    .select("id, permalink, thread_selftext, ups, comments, post_created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!o) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (o.thread_selftext) return NextResponse.json({ selftext: o.thread_selftext, ups: o.ups, comments: o.comments });

  const thread = await fetchThread(o.permalink);
  if (!thread) return NextResponse.json({ error: "Reddit didn't return this post." }, { status: 502 });

  const update = {
    thread_selftext: thread.selftext || null,
    thread_comments: thread.comments?.length ? thread.comments : null,
  };
  // Search results carry no vote or comment counts; the fetch does.
  if (thread.ups > (o.ups || 0)) update.ups = thread.ups;
  if (thread.numComments > (o.comments || 0)) update.comments = thread.numComments;
  if (!o.post_created_at && thread.createdAt) update.post_created_at = new Date(thread.createdAt).toISOString();
  const { error } = await supabase.from("opportunities").update(update).eq("id", o.id).eq("user_id", user.id);
  if (error) console.error("[opportunities/post] save failed:", error.message);

  return NextResponse.json({
    selftext: thread.selftext,
    author: thread.author,
    ups: update.ups ?? o.ups,
    comments: update.comments ?? o.comments,
  });
}
