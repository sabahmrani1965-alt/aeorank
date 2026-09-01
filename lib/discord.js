// Discord webhook notifications for new CrewQuest poster tasks. Same
// fail-soft convention as lib/email.js's Resend wrapper — a missing
// DISCORD_WEBHOOK_URL just skips the send rather than breaking the caller.
const TYPE_LABEL = { comment: "Comment", reply: "Reply", post: "Post", upvote: "Upvote" };

// Poster-facing domain — same one app/api/admin/notify-posters/route.js
// already hardcodes for this audience, not the aeorank.tech marketing site.
const POSTER_SITE_URL = "https://www.joincrewquest.com";

export function isDiscordConfigured() {
  return Boolean(process.env.DISCORD_WEBHOOK_URL);
}

export async function sendDiscordMessage(payload) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.warn("[discord] DISCORD_WEBHOOK_URL not set — skipping message");
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[discord] webhook error", res.status, err);
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch (e) {
    console.error("[discord] send failed:", e?.message || e);
    return { ok: false, error: String(e?.message || e) };
  }
}

function taskMessage({ id, type, extraLine }) {
  const label = TYPE_LABEL[type] || type;
  return [
    "New Task Notification @everyone",
    `Task Type: ${label}`,
    `Task ID: ${id}`,
    ...(extraLine ? [extraLine] : []),
    `Task Link: ${POSTER_SITE_URL}/poster`,
    "Please click the link to claim this task. It's first-come, first-served. New users will need to register first.",
  ].join("\n");
}

// Announces a new task the moment it's saved (app/api/drafts/route.js), in
// the plain-text "Task Notice" bot format. `ids` is every report_drafts row
// just inserted for this order — comment/reply/post orders are always a
// single row, so that's one message with its real Task ID. An upvote order
// is `qty` identical rows (one per poster slot, see MIN/MAX_UPVOTE_QTY in
// that route) — sending one Discord message per row there would mean up to
// 500 near-identical pings per order, so those collapse into one message
// using the first row's id, with a "Slots" line instead of per-row spam.
export async function notifyNewTask({ ids, type }) {
  if (!isDiscordConfigured() || !ids?.length) return { ok: false, skipped: true };

  const extraLine = type === "upvote" && ids.length > 1 ? `Slots: ${ids.length}` : null;

  return sendDiscordMessage({
    content: taskMessage({ id: ids[0], type, extraLine }),
    allowed_mentions: { parse: ["everyone"] },
  });
}
