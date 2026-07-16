import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";

export const runtime = "nodejs";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin
    .from("credit_packages")
    .select("id, name, credits, price_cents, currency, active, created_at")
    .order("price_cents", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load packages." }, { status: 500 });

  return NextResponse.json({ packages: data || [] });
}

export async function POST(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const name = String(body?.name || "").trim();
  const credits = Number(body?.credits);
  const priceCents = Number(body?.price_cents);
  const currency = String(body?.currency || "usd").trim().toLowerCase();

  if (!name || !credits || !priceCents) {
    return NextResponse.json({ error: "name, credits, and price_cents are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin
    .from("credit_packages")
    .insert({ name, credits, price_cents: priceCents, currency })
    .select("id, name, credits, price_cents, currency, active, created_at")
    .single();
  if (error) return NextResponse.json({ error: "Could not create package." }, { status: 500 });

  return NextResponse.json({ ok: true, package: data });
}

// Toggle active/inactive — the only edit a package needs post-creation
// (price/credits changes are just create-a-new-one-and-deactivate-the-old).
export async function PATCH(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const id = String(body?.id || "").trim();
  if (!id || typeof body?.active !== "boolean") {
    return NextResponse.json({ error: "id and active are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { error } = await admin.from("credit_packages").update({ active: body.active }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update package." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
