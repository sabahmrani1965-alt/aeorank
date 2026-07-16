import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/adminAuth";

export const runtime = "nodejs";

const SELECT_COLS = "id, name, credits, bonus_credits, price_cents, currency, active, badge, description, created_at";

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

  const { data, error } = await admin.from("credit_packages").select(SELECT_COLS).order("price_cents", { ascending: true });
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
  const bonusCredits = Number(body?.bonus_credits) || 0;
  const badge = body?.badge ? String(body.badge).trim().slice(0, 40) : null;
  const description = body?.description ? String(body.description).trim().slice(0, 300) : null;

  if (!name || !credits || !priceCents) {
    return NextResponse.json({ error: "name, credits, and price_cents are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin
    .from("credit_packages")
    .insert({ name, credits, price_cents: priceCents, currency, bonus_credits: bonusCredits, badge, description })
    .select(SELECT_COLS)
    .single();
  if (error) return NextResponse.json({ error: "Could not create package." }, { status: 500 });

  return NextResponse.json({ ok: true, package: data });
}

// Whitelist-style partial update — covers both the active/inactive toggle
// and full field edits (name/credits/price/bonus/badge/description).
export async function PATCH(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const id = String(body?.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const updates = {};
  if (typeof body.active === "boolean") updates.active = body.active;
  if ("name" in body) {
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "name can't be empty." }, { status: 400 });
    updates.name = name;
  }
  if ("credits" in body) {
    const credits = Number(body.credits);
    if (!credits || credits < 1) return NextResponse.json({ error: "credits must be a positive number." }, { status: 400 });
    updates.credits = credits;
  }
  if ("price_cents" in body) {
    const priceCents = Number(body.price_cents);
    if (!priceCents || priceCents < 1) return NextResponse.json({ error: "price_cents must be a positive number." }, { status: 400 });
    updates.price_cents = priceCents;
  }
  if ("bonus_credits" in body) updates.bonus_credits = Math.max(0, Number(body.bonus_credits) || 0);
  if ("badge" in body) updates.badge = body.badge ? String(body.badge).trim().slice(0, 40) : null;
  if ("description" in body) updates.description = body.description ? String(body.description).trim().slice(0, 300) : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const { data, error } = await admin.from("credit_packages").update(updates).eq("id", id).select(SELECT_COLS).single();
  if (error) return NextResponse.json({ error: "Could not update package." }, { status: 500 });

  return NextResponse.json({ ok: true, package: data });
}
