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

export async function GET() {
  const admin_ = await requireAdminUser();
  if (!admin_) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin
    .from("users")
    .select("id, email, created_at")
    .eq("role", "poster")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load posters." }, { status: 500 });

  return NextResponse.json({ posters: data || [] });
}

// Direct admin-initiated invite — no referrer (an invite arriving via a
// poster's "Refer a friend" link goes through the separate apply-poster +
// approve flow instead, which does carry a referredBy).
export async function POST(req) {
  const adminUser = await requireAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const result = await createOrPromotePoster({ email, referredBy: null, origin: siteOrigin(req) });
  if (!result.ok) {
    const status = result.error === "not_configured" ? 500 : 500;
    return NextResponse.json({ error: "Could not create this account." }, { status });
  }

  return NextResponse.json({
    ok: true,
    isNewAccount: result.isNewAccount,
    emailSent: result.emailSent,
    temporaryPassword: result.temporaryPassword,
  });
}
