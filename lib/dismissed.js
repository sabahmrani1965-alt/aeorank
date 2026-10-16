import { createAdminClient } from "@/lib/supabase/admin";

// Threads a user marked "Not relevant" on the Opportunities page. The row
// is deleted, and its permalink is remembered here so a later refresh
// (lib/opportunities.js) doesn't add it back. One small JSON file per brand
// in the private Storage bucket below; Storage, not a column, because this
// project's schema can't be migrated from where it's developed.
const BUCKET = "dismissed-opportunities";
const MAX = 2000;
const path = (userId, profileId) => `${userId}/${profileId}.json`;

export async function getDismissed(userId, profileId) {
  const admin = createAdminClient();
  if (!admin || !userId || !profileId) return new Set();
  const { data } = await admin.storage.from(BUCKET).download(path(userId, profileId));
  if (!data) return new Set();
  try {
    const list = JSON.parse(await data.text());
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

export async function addDismissed(userId, profileId, permalink) {
  const admin = createAdminClient();
  if (!admin || !permalink) return false;
  const set = await getDismissed(userId, profileId);
  set.add(permalink);
  const list = [...set].slice(-MAX);
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path(userId, profileId), JSON.stringify(list), { contentType: "application/json", upsert: true });
  if (error) console.error("[dismissed] save failed:", error.message);
  return !error;
}
