import { createHash } from "node:crypto";

// Shared by the outreach sender (app/api/cron/outreach), the admin page
// (app/admin/outreach) and the brand report's visit log. The queue is
// outreach/queue.json in Storage: [{ to, firstname, brand, category, status,
// sent_at, resend_id, followup_at, ... }]. Statuses: queued, sent,
// followed_up, replied, optout, skipped_named, failed.

export const OUTREACH_BUCKET = "outreach";
const QUEUE = "queue.json";

// The short code in a report link (?r=), so a visit can be tied to an email.
export const refOf = (email) => createHash("sha256").update(String(email).toLowerCase()).digest("hex").slice(0, 10);

export async function readQueue(admin) {
  const { data } = await admin.storage.from(OUTREACH_BUCKET).download(QUEUE);
  if (!data) return [];
  try {
    const j = JSON.parse(await data.text());
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

export async function writeQueue(admin, items) {
  return admin.storage
    .from(OUTREACH_BUCKET)
    .upload(QUEUE, JSON.stringify(items, null, 1), { contentType: "application/json", upsert: true, cacheControl: "60" });
}

// Email security scanners open links before people do: within a minute or two
// of delivery, with tell-tale user agents.
const BOT_UA = /bot|crawl|spider|preview|scan|proofpoint|mimecast|barracuda|safelinks|python|curl|wget|headless|go-http|java\//i;
export function looksLikeBot(visit, sentAt) {
  if (!visit.ua || BOT_UA.test(visit.ua)) return true;
  if (sentAt && Date.parse(visit.at) - Date.parse(sentAt) < 120000) return true;
  return false;
}

/** The newest report visits that came from an email link (they carry ?r=). */
export async function readVisits(admin, limit = 300) {
  const bucket = admin.storage.from(OUTREACH_BUCKET);
  const { data: files } = await bucket.list("visits", { limit, sortBy: { column: "name", order: "desc" } });
  const visits = await Promise.all(
    (files || []).map(async (f) => {
      const { data } = await bucket.download(`visits/${f.name}`);
      try {
        return data ? JSON.parse(await data.text()) : null;
      } catch {
        return null;
      }
    })
  );
  return visits.filter((v) => v?.ref);
}
