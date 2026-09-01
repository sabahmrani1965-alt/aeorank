// Discord webhook notifications for new CrewQuest poster tasks. Same
// fail-soft convention as lib/email.js's Resend wrapper — a missing
// DISCORD_WEBHOOK_URL just skips the send rather than breaking the caller.
import { displaySubreddit } from "./format";
import { rateForType } from "./posterPay";

const TYPE_LABEL = { comment: "Comment", reply: "Reply", post: "Post", upvote: "Upvote" };
const TYPE_COLOR = { comment: 0x5aa9ff, reply: 0xb084f0, post: 0x63d29a, upvote: 0xf2a83b };

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

// Announces one new task/order the moment it's saved (app/api/drafts/route.js)
// — one message per order, not one per poster slot, since an upvote order is
// `qty` identical rows for the same job (see MIN/MAX_UPVOTE_QTY there).
export async function notifyNewTask({ type, subreddit, title, qty = 1 }) {
  if (!isDiscordConfigured()) return { ok: false, skipped: true };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aeorank.tech";
  const label = TYPE_LABEL[type] || type;
  const reward = rateForType(type);

  return sendDiscordMessage({
    embeds: [
      {
        title: `New ${label} task — r/${displaySubreddit(subreddit)}`,
        url: `${siteUrl}/poster`,
        description: title || undefined,
        color: TYPE_COLOR[type] ?? 0x5aa9ff,
        fields: [
          { name: "Reward", value: `$${reward.toFixed(2)}`, inline: true },
          { name: "Slots", value: String(qty), inline: true },
        ],
        footer: { text: "CrewQuest · aeorank.tech/poster" },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
