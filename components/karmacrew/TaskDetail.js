"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Countdown from "./Countdown";
import DraftViewer from "./DraftViewer";
import SubmissionForm from "./SubmissionForm";
import StatusBadge from "./StatusBadge";
import RewardBadge from "./RewardBadge";

const TYPE_LABEL = { comment: "Comment", reply: "Reply", post: "Post", upvote: "Upvote" };

// Content-quality tips (sound like a real person, stay on-topic, avoid
// engagement bait) were dropped — the content itself is pre-written, so
// the poster has no control over it. What's left is only about the
// poster's own actions, which still matter regardless of who wrote the text.
const DOS_DONTS = {
  dos: ["Only post once, no duplicates"],
  donts: ["Don't mention you were paid to post this", "Don't spam the same content elsewhere"],
};

function SubredditLink({ subreddit }) {
  return (
    <a
      href={`https://www.reddit.com/r/${subreddit}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "inherit", textDecoration: "none" }}
      title={`Open r/${subreddit} on Reddit`}
    >
      r/{subreddit}
    </a>
  );
}

export default function TaskDetail({ task, reward }) {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState("");

  async function cancelTask() {
    if (!confirm("Cancel this task and put it back in the pool for someone else?")) return;
    setReleaseError("");
    setReleasing(true);
    try {
      const res = await fetch(`/api/poster/tasks/${task.id}/release`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not cancel this task.");
      router.push("/poster");
      router.refresh();
    } catch (err) {
      setReleaseError(err?.message || "Something went wrong.");
      setReleasing(false);
    }
  }

  if (task.status === "submitted" && task.verification_status === "changes_requested") {
    return (
      <section>
        <span className="section-tag">( changes requested )</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}><SubredditLink subreddit={task.subreddit} /></h2>
          <RewardBadge amount={reward} />
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <StatusBadge status="changes_requested" />
          <p style={{ marginTop: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: "14px 0 0" }}>
            {task.admin_notes || "An admin asked for a fix on this one before it can be approved. Take another look, then resubmit below."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Instructions</div>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                {task.type === "post"
                  ? `Post the title and body below as a new post in r/${task.subreddit}, from your own Reddit account.`
                  : task.title}
              </p>
            </div>

            {task.type !== "post" && task.target_url && (
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>
                  {task.type === "reply" ? "Comment to reply to" : task.type === "upvote" ? "Post or comment to upvote" : "Thread to comment on"}
                </div>
                <a
                  href={task.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", fontSize: 14, wordBreak: "break-all" }}
                >
                  {task.target_url} ↗
                </a>
              </div>
            )}

            {task.type !== "upvote" && (
              <div className="card" style={{ padding: 22 }}>
                <DraftViewer initialTitle={task.title} initialBody={task.body} type={task.type} />
              </div>
            )}

            {task.permalink && (
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>What you submitted before</div>
                <a href={task.permalink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 14, wordBreak: "break-all" }}>
                  {task.permalink} ↗
                </a>
              </div>
            )}
          </div>

          <SubmissionForm taskId={task.id} type={task.type} mode="resubmit" />
        </div>
      </section>
    );
  }

  if (task.status === "submitted") {
    const pendingReview = task.verification_status === "needs_review";
    return (
      <section>
        <span className="section-tag">( submitted )</span>
        <h2><SubredditLink subreddit={task.subreddit} /></h2>
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <StatusBadge status={pendingReview ? "pending_review" : "submitted"} />
          <p style={{ marginTop: 14, color: "var(--text-dim)" }}>
            {pendingReview
              ? "Submitted. We couldn't automatically confirm this one's live, so it's waiting on a quick manual check before it counts toward your earnings. You'll see it move to Approved once that's done."
              : "Nice work. This one's in. It'll show up in your Earnings and History."}
          </p>
          {task.permalink && (
            <a href={task.permalink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 14 }}>
              View live post ↗
            </a>
          )}
          <div style={{ marginTop: 18 }}>
            <button type="button" onClick={() => router.push("/poster")} className="btn btn-primary">
              Pick another task →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (expired) {
    return (
      <section>
        <div className="kc-empty-state fade-in">
          <div className="kc-empty-state-icon">⏰</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Time's up on this one.</div>
          <div style={{ fontSize: 13.5, maxWidth: 340 }}>It's back in the pool for someone else. Grab a new task.</div>
          <button type="button" onClick={() => router.push("/poster")} className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
            Back to tasks →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <span className="section-tag">( in progress )</span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <h2 style={{ margin: 0 }}><SubredditLink subreddit={task.subreddit} /></h2>
        <RewardBadge amount={reward} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="kc-badge kc-badge-neutral">{TYPE_LABEL[task.type] || "Comment"}</span>
          <Countdown expiresAt={task.claim_expires_at} onExpire={() => setExpired(true)} />
        </div>
        <button type="button" onClick={cancelTask} disabled={releasing} className="btn btn-ghost btn-sm">
          {releasing ? "Cancelling…" : "Cancel task"}
        </button>
      </div>
      {releaseError && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13, marginTop: -12, marginBottom: 20 }}>
          {releaseError}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Instructions</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
              {task.type === "post"
                ? `Post the title and body below as a new post in r/${task.subreddit}, from your own Reddit account.`
                : task.title}
            </p>
          </div>

          {/* Where this goes. First thing a poster needs, so it sits above
              the draft itself. Older tasks predate target_url and have
              none — say so plainly rather than rendering a dead link. */}
          {task.type !== "post" && (
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                {task.type === "reply"
                  ? "Comment to reply to"
                  : task.type === "upvote"
                  ? "Post or comment to upvote"
                  : "Thread to comment on"}
              </div>
              {task.target_url ? (
                <a
                  href={task.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", fontSize: 14, wordBreak: "break-all" }}
                >
                  {task.target_url} ↗
                </a>
              ) : (
                <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                  No link was given for this task. Search r/{task.subreddit} for the
                  thread described above, or release it and pick another.
                </p>
              )}
            </div>
          )}

          {task.type === "upvote" ? (
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>How this works</div>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                Open the link above on Reddit from your own account and upvote it.
                That's it: nothing to write, no comment to post. Confirm below once you've done it.
              </p>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13.5, color: "var(--msg-success)" }}>Do</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                      {DOS_DONTS.dos.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13.5, color: "var(--msg-danger)" }}>Don't</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                      {DOS_DONTS.donts.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 22 }}>
                <DraftViewer initialTitle={task.title} initialBody={task.body} type={task.type} />
              </div>
            </>
          )}
        </div>

        <SubmissionForm taskId={task.id} type={task.type} />
      </div>
    </section>
  );
}
