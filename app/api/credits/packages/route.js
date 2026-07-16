import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("credit_packages")
    .select("id, name, credits, bonus_credits, price_cents, currency, badge, description")
    .eq("active", true)
    .order("price_cents", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load packages." }, { status: 500 });
  }

  return NextResponse.json({ packages: data || [] });
}
