// The one-time scan a brand gets at the end of onboarding (see
// app/api/onboarding/preview). Kept in the private free-checks bucket under
// previews/, one JSON file per brand, because no schema change is possible
// from the app (no DDL access).
const BUCKET = "free-checks";
const DIR = "previews";

export async function loadPreview(admin, profileId) {
  const { data } = await admin.storage.from(BUCKET).download(`${DIR}/${profileId}.json`);
  if (!data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

export async function savePreview(admin, profileId, preview) {
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(`${DIR}/${profileId}.json`, JSON.stringify(preview), { contentType: "application/json", upsert: true });
  if (error) console.error("[onboarding-preview] save failed:", error.message);
}

// How many previews ran today (UTC), for the daily cap on paid AI calls.
export async function previewsToday(admin) {
  const day = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin.storage
    .from(BUCKET)
    .list(DIR, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  if (error) return Infinity;
  return (data || []).filter((f) => String(f.created_at || "").startsWith(day)).length;
}
