import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { checkPrompt, isAiVisibilityConfigured, persistCheckResults } from "@/lib/aivisibility";

export const runtime = "nodejs";
// Cloro (ChatGPT/Perplexity) averages 30-45s per call — comfortably over
// the old 30s ceiling that was sized for Gemini/Claude alone.
export const maxDuration = 60;

export async function POST(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!(await hasActiveSubscription(supabase, user.id))) {
    return NextResponse.json({ error: "This requires an active plan." }, { status: 403 });
  }

  if (!isAiVisibilityConfigured()) {
    return NextResponse.json({ error: "AI visibility checks aren't configured." }, { status: 500 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const profile = await getActiveCompanyProfile(supabase, user.id);
  const brand = profile?.company_name || "";
  if (!brand) {
    return NextResponse.json(
      { error: "Complete your company profile first (Settings) so we know which brand to check." },
      { status: 400 }
    );
  }

  // Scoped to the active brand, not just user_id — a user with 2+ brands
  // could otherwise pass a prompt id that's still their own row but
  // belongs to a different brand than the one currently active.
  const { data: prompt } = await admin
    .from("prompts")
    .select("id, text")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("company_profile_id", profile.id)
    .maybeSingle();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found." }, { status: 404 });
  }

  const results = await checkPrompt(prompt.text, brand);
  if (!results) {
    return NextResponse.json(
      { error: "Couldn't check this prompt right now. Try again." },
      { status: 502 }
    );
  }
  const checkedAt = new Date().toISOString();

  // persistCheckResults writes prompts.last_* (the primary result) plus
  // one prompt_checks history row per engine that answered — see
  // lib/aivisibility.js. Best-effort: it logs its own failures rather
  // than throwing, so a DB hiccup never hides a check that did complete.
  const primary = await persistCheckResults(admin, {
    promptId: prompt.id,
    userId: user.id,
    results,
    checkedAt,
  });

  return NextResponse.json({
    ok: true,
    checkedAt,
    results,
    primary,
  });
}
