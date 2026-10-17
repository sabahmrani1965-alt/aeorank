import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/adminAuth";
import { readQueue, writeQueue } from "@/lib/outreach";

export const dynamic = "force-dynamic";

// The owner marks a contact as replied or opted out (which stops the
// follow-up), or puts them back. Body: { to, status }.
const ALLOWED = new Set(["replied", "optout", "sent"]);

export async function POST(req) {
  if (!(await requireAdminUser())) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const { to, status } = await req.json().catch(() => ({}));
  if (!to || !ALLOWED.has(status)) return NextResponse.json({ error: "Expected { to, status }." }, { status: 400 });

  const admin = createAdminClient();
  const items = await readQueue(admin);
  const it = items.find((x) => x.to === to);
  if (!it) return NextResponse.json({ error: "Not in the queue." }, { status: 404 });
  if (!it.sent_at) return NextResponse.json({ error: "Not emailed yet." }, { status: 409 });

  // "sent" undoes a mark; it goes back to followed_up if the follow-up went out.
  it.status = status === "sent" && it.followup_id ? "followed_up" : status;
  it.marked_at = new Date().toISOString();
  const { error } = await writeQueue(admin, items);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: it.status });
}
