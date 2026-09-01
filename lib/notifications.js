// Poster-facing review-decision notifications: an in-app row (persisted
// independently of report_drafts, since a reject wipes that row's own
// state — see supabase/schema.sql's notifications table comment) and,
// when Resend is configured, an email. Same fail-soft convention as
// lib/email.js/lib/discord.js — a missing RESEND_API_KEY just skips the
// email, it never blocks the review decision itself.
import { sendEmail, isEmailConfigured, esc } from "./email";
import { displaySubreddit } from "./format";

const POSTER_SITE_URL = "https://www.joincrewquest.com";

// Keyed on the review route's own `decision` values verbatim — no
// translation layer between the two.
const COPY = {
  approve: ({ subreddit }) => ({
    message: `Your r/${subreddit} task was approved — it now counts toward your earnings.`,
    subject: "Task approved on CrewQuest",
    heading: "Task approved",
    body: `Your submission for r/${subreddit} was reviewed and approved. It now counts toward your earnings.`,
    cta: { label: "View your earnings →", url: `${POSTER_SITE_URL}/poster/earnings` },
  }),
  request_changes: ({ subreddit, note, taskId }) => ({
    message: `Changes requested on your r/${subreddit} task: ${note}`,
    subject: "A CrewQuest task needs a quick fix",
    heading: "Changes requested",
    body: `An admin reviewed your submission for r/${subreddit} and asked for a fix before it can be approved:\n\n"${note}"`,
    cta: { label: "Fix and resubmit →", url: `${POSTER_SITE_URL}/poster/task/${taskId}` },
  }),
  reject: ({ subreddit }) => ({
    message: `Your r/${subreddit} task was rejected and returned to the pool.`,
    subject: "A CrewQuest task was rejected",
    heading: "Task rejected",
    body: `Your submission for r/${subreddit} was reviewed and rejected, and it's back in the open pool for someone else. This one didn't earn a payout, but there are plenty of other tasks open.`,
    cta: { label: "Pick another task →", url: `${POSTER_SITE_URL}/poster` },
  }),
};

function emailHtml({ heading, body, cta }) {
  return `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0e1d;line-height:1.55;max-width:560px">
      <h2 style="margin:0 0 12px">${esc(heading)}</h2>
      <p style="color:#444;margin:0 0 20px;white-space:pre-line">${esc(body)}</p>
      <p style="margin-top:24px">
        <a href="${esc(cta.url)}" style="color:#f2a83b;font-weight:600">${esc(cta.label)}</a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:28px">
        You're getting this because you have a CrewQuest creator account.
      </p>
    </div>`;
}

// Fires both effects for one review decision. `admin` must be the
// service-role client — notifications' RLS only lets a poster SELECT
// their own rows, never insert. Best-effort throughout: a failure here
// must never undo or block the review decision that triggered it (see
// the try/catch at the call site in app/api/admin/drafts/[id]/review).
export async function notifyReviewDecision(admin, { posterId, decision, subreddit, note, taskId }) {
  const copyFn = COPY[decision];
  if (!copyFn || !posterId) return;

  const copy = copyFn({ subreddit: displaySubreddit(subreddit), note, taskId });

  await admin.from("notifications").insert({
    poster_id: posterId,
    type: decision,
    message: copy.message,
    task_id: taskId,
  });

  if (!isEmailConfigured()) return;
  const { data: posterRow } = await admin.from("users").select("email").eq("id", posterId).maybeSingle();
  if (!posterRow?.email) return;

  await sendEmail({
    to: posterRow.email,
    subject: copy.subject,
    html: emailHtml(copy),
    text: `${copy.heading}\n\n${copy.body}\n\n${copy.cta.url}`,
  });
}
