import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";
import { suggestPrompts, isLlmConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: "AI suggestions aren't configured." }, { status: 500 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  const brand = profile?.company_name || "";
  if (!brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Settings) so we know which brand to suggest prompts for." },
      { status: 400 }
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const existing = Array.isArray(body?.existing)
    ? body.existing.filter((s) => typeof s === "string").slice(0, 30)
    : [];

  const suggestions = await suggestPrompts(brand, profile?.description || "", existing);
  if (!suggestions) {
    return NextResponse.json({ error: "Could not generate suggestions right now. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, suggestions });
}
