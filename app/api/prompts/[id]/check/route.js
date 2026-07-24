import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasActiveSubscription } from "@/lib/subscription";
import { getActiveCompanyProfile } from "@/lib/brands";
import { checkPrompt, isAiVisibilityConfigured } from "@/lib/aivisibility";

export const runtime = "nodejs";
export const maxDuration = 30;

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

  const result = await checkPrompt(prompt.text, brand);
  if (!result) {
    return NextResponse.json(
      { error: "Couldn't check this prompt right now. Try again." },
      { status: 502 }
    );
  }
  const checkedAt = new Date().toISOString();

  const { error: updateError } = await admin
    .from("prompts")
    .update({
      last_checked_at: checkedAt,
      last_mentioned: result.mentioned,
      last_position: result.position,
      last_brands: result.brands,
      last_answer: result.answer,
      last_model: result.model,
    })
    .eq("id", prompt.id);
  if (updateError) {
    console.error("[prompts/check] save failed:", updateError.message);
  }

  // Immutable history row, alongside the prompts.last_* cache above — this
  // is what the detail page's trend chart/Top Brands/Recent Checks read from.
  const { error: historyError } = await admin.from("prompt_checks").insert({
    prompt_id: prompt.id,
    user_id: user.id,
    mentioned: result.mentioned,
    position: result.position,
    brands: result.brands,
    answer: result.answer,
    model: result.model,
    created_at: checkedAt,
  });
  if (historyError) {
    console.error("[prompts/check] history insert failed:", historyError.message);
  }

  return NextResponse.json({
    ok: true,
    result: { ...result, checkedAt },
  });
}
