import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/adminAuth";
import { createOrPromotePoster } from "@/lib/posterAccount";

export const runtime = "nodejs";

function siteOrigin(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req, { params }) {
  const adminUser = await requireAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data: application } = await admin
    .from("poster_applications")
    .select("id, email, referred_by, reddit_username, reddit_check_status, status")
    .eq("id", params.id)
    .maybeSingle();

  if (!application || application.status !== "pending") {
    return NextResponse.json({ error: "Application not found or already handled." }, { status: 404 });
  }

  const result = await createOrPromotePoster({
    email: application.email,
    referredBy: application.referred_by,
    redditUsername: application.reddit_username,
    redditCheckStatus: application.reddit_check_status,
    origin: siteOrigin(req),
  });
  if (!result.ok) {
    return NextResponse.json({ error: "Could not create this account." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("poster_applications")
    .update({ status: "approved" })
    .eq("id", params.id);
  if (updateError) {
    console.error("[poster-applications/approve] status update failed:", updateError.message);
  }

  return NextResponse.json({
    ok: true,
    isNewAccount: result.isNewAccount,
    emailSent: result.emailSent,
    temporaryPassword: result.temporaryPassword,
  });
}
