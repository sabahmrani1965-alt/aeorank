// Pages the AI engines cited for a tracked prompt (ChatGPT with web search,
// lib/openai.js). Kept in Storage, one JSON file per prompt, because
// prompt_checks has no column for them and schema changes aren't possible
// from the app (no DDL access). Newest entries last, capped.
const BUCKET = "prompt-sources";
const KEEP = 90;

export const domainOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

export async function loadPromptSources(admin, promptId) {
  const { data } = await admin.storage.from(BUCKET).download(`${promptId}.json`);
  if (!data) return [];
  try {
    return JSON.parse(await data.text());
  } catch {
    return [];
  }
}

export async function appendPromptSources(admin, promptId, entries) {
  if (!entries.length) return;
  const bucket = admin.storage.from(BUCKET);
  let list = await loadPromptSources(admin, promptId);
  list = [...list, ...entries].slice(-KEEP);
  let { error } = await bucket.upload(`${promptId}.json`, JSON.stringify(list), { contentType: "application/json", upsert: true, cacheControl: "60" });
  if (error && /not found/i.test(error.message)) {
    await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});
    ({ error } = await bucket.upload(`${promptId}.json`, JSON.stringify(list), { contentType: "application/json", upsert: true, cacheControl: "60" }));
  }
  if (error) console.error("[prompt-sources] save failed:", error.message);
}
