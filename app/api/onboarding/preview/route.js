import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCompanyProfile } from "@/lib/brands";
import { refreshOpportunitiesForBrand } from "@/lib/opportunities";
import { pickCategoryQuery } from "@/lib/keywords";
import { detectCategory } from "@/lib/llm";
import { analyzeBrandVisibility, isAiVisibilityConfigured } from "@/lib/aivisibility";
import { loadPreview, savePreview, previewsToday } from "@/lib/onboardingPreview";

export const runtime = "nodejs";
export const maxDuration = 60;

// Same global cap as the public free checker: each AI check costs roughly
// eight paid model calls.
const AI_PER_DAY = Number(process.env.FREE_CHECK_DAILY_CAP || 40);
const MIN_ANSWERS = 2;
// Scans in progress on this server instance, by brand id.
const running = new Map();

// One real scan for a brand that has just finished onboarding, before any
// plan: its Reddit opportunities and how the AI engines answer its
// category. Runs once per brand (the result is kept and returned again),
// so the customer sees their own numbers before being asked to pay.
export async function POST() {
  const deadline = Date.now() + 44000;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const profile = await getActiveCompanyProfile(supabase, user.id);
  if (!profile) return NextResponse.json({ error: "Add your website first." }, { status: 400 });

  const admin = createAdminClient();
  let preview = admin ? await loadPreview(admin, profile.id) : null;

  // A scan already running for this brand (double click, second tab):
  // wait for it instead of paying for another.
  if (!preview && running.has(profile.id)) preview = await running.get(profile.id).catch(() => null);

  if (!preview) {
    let done;
    running.set(profile.id, new Promise((r) => (done = r)));
    try {
      const brand = profile.company_name || "";
      const description = profile.description || "";
      let domain = "";
      try {
        domain = new URL(/^https?:/i.test(profile.website || "") ? profile.website : `https://${profile.website}`).hostname.replace(/^www\./, "");
      } catch {}

      const runAi = admin && isAiVisibilityConfigured() && (await previewsToday(admin)) < AI_PER_DAY;
      const [, ai] = await Promise.all([
        refreshOpportunitiesForBrand(supabase, { userId: user.id, companyProfileId: profile.id, brand, description }).catch((e) =>
          console.error("[onboarding/preview] opportunities failed:", e?.message || e)
        ),
        runAi
          ? (async () => {
              const category = (await detectCategory(brand, description, domain)) || pickCategoryQuery(description, brand);
              const result = await analyzeBrandVisibility(brand, category, { deadline });
              return { category, result };
            })().catch((e) => console.error("[onboarding/preview] ai check failed:", e?.message || e))
          : null,
      ]);

      const r = ai?.result;
      const byEngine = {};
      for (const row of r?.rows || []) {
        byEngine[row.model] = byEngine[row.model] || { answers: 0, mentions: 0 };
        byEngine[row.model].answers += 1;
        if (row.mentioned) byEngine[row.model].mentions += 1;
      }
      preview = {
        at: new Date().toISOString(),
        brand,
        ai:
          r && r.score !== null && r.total >= MIN_ANSWERS
            ? { category: ai.category, score: r.score, hits: r.hits, total: r.total, byEngine, competitors: (r.competitors || []).slice(0, 6) }
            : null,
      };
      // Kept only when something came back, so a failed scan can be retried.
      if (admin && preview.ai) await savePreview(admin, profile.id, preview);
    } finally {
      done(preview);
      running.delete(profile.id);
    }
  }

  const [{ data: top }, { count }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, sub, title, relevance_score, buying_intent, comments")
      .eq("user_id", user.id)
      .eq("company_profile_id", profile.id)
      .order("relevance_score", { ascending: false, nullsFirst: false })
      .limit(3),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("company_profile_id", profile.id),
  ]);

  return NextResponse.json({ ok: true, ...preview, opportunities: { total: count || 0, top: top || [] } });
}
