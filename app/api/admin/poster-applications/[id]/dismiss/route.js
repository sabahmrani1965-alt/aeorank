import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  const adminUser = await requireAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { error } = await admin
    .from("poster_applications")
    .update({ status: "dismissed" })
    .eq("id", params.id)
    .eq("status", "pending");

  if (error) {
    console.error("[poster-applications/dismiss] failed:", error.message);
    return NextResponse.json({ error: "Could not dismiss this application." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
