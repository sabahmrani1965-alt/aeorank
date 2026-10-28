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

// Reddit post id from a thread or comment URL ("1t6jj1s"), or null.
export function redditThreadId(u) {
  const m = String(u || "").match(/reddit\.com\/r\/[^/]+\/comments\/([a-z0-9]+)/i);
  return m ? m[1].toLowerCase() : null;
}

// Reddit threads the AI engines cited when answering this brand's tracked
// prompts, newest first: [{ id, url, title, sub, models, lastAt, prompt }].
// Read with the admin client (the bucket is private), so callers must pass
// prompts already matched to the signed-in user.
export async function loadCitedRedditThreads(admin, prompts) {
  if (!admin || !prompts?.length) return [];
  const logs = await Promise.all(prompts.map((p) => loadPromptSources(admin, p.id).catch(() => [])));
  const threads = new Map();
  logs.forEach((log, i) => {
    for (const e of log) {
      for (const s of e.sources || []) {
        const id = redditThreadId(s.url);
        if (!id) continue;
        const t = threads.get(id) || {
          id,
          url: s.url.split("?")[0],
          title: s.title || "",
          sub: s.url.match(/\/r\/([^/]+)/)?.[1] ? `r/${s.url.match(/\/r\/([^/]+)/)[1]}` : "",
          models: [],
          lastAt: null,
          prompt: prompts[i].text || "",
        };
        if (e.model && !t.models.includes(e.model)) t.models.push(e.model);
        if (!t.lastAt || e.at > t.lastAt) {
          t.lastAt = e.at;
          t.prompt = prompts[i].text || t.prompt;
        }
        if (!t.title && s.title) t.title = s.title;
        threads.set(id, t);
      }
    }
  });
  return [...threads.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));
}
