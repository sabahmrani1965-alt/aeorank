import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser } from "@/lib/posterTasks";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const permalink = String(body?.permalink || "").trim();
  if (!permalink) {
    return NextResponse.json({ error: "Paste the live Reddit link before submitting." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const nowIso = new Date().toISOString();
  const { data, error } = await admin
    .from("report_drafts")
    .update({ status: "submitted", posted: true, posted_at: nowIso, permalink: permalink.slice(0, 500) })
    .eq("id", params.id)
    .eq("claimed_by", user.id)
    .eq("status", "claimed")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not submit — this task may have expired or already been submitted." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
