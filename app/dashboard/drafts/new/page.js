"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CREDIT_COSTS, upvoteCreditCost } from "@/lib/credits";
import { needsTargetUrl, normalizeRedditUrl } from "@/lib/format";

const TYPES = [
  { key: "comment", label: "Post a Comment" },
  { key: "post", label: "Create a Post" },
  { key: "reply", label: "Reply to a Comment" },
  { key: "upvote", label: "Order Upvote" },
];
const TONES = ["Helpful", "Casual", "Expert", "Enthusiastic"];
const LENGTHS = [
  { key: "short", label: "Short" },
  { key: "medium", label: "Medium" },
  { key: "long", label: "Long" },
];

const selectStyle = {
  background: "var(--bg-3)",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--text)",
  fontFamily: "inherit",
};

const SAVE_COST = {
  comment: CREDIT_COSTS.generate_comment,
  reply: CREDIT_COSTS.generate_reply,
  post: CREDIT_COSTS.generate_post,
};

const MIN_UPVOTE_QTY = 10;

export default function NewDraftPage() {
  return (
    <Suspense fallback={null}>
      <NewDraftForm />
    </Suspense>
  );
}

function NewDraftForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState("comment");
  // Only used for "post" — comment/reply have no separate subreddit input,
  // it's derived server-side from the required thread link instead.
  const [subreddit, setSubreddit] = useState(searchParams.get("subreddit") || "");
  // Prefilled when you arrive from an Opportunity card, which already knows
  // the thread's permalink — typed by hand otherwise.
  const [targetUrl, setTargetUrl] = useState(searchParams.get("url") || "");
  const [tone, setTone] = useState("Helpful");
  const [length, setLength] = useState("medium");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [qty, setQty] = useState(MIN_UPVOTE_QTY);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInfo, setSavedInfo] = useState(null); // { creditsCharged, creditsRemaining }

  const ready = needsTargetUrl(type) ? Boolean(normalizeRedditUrl(targetUrl)) : Boolean(subreddit.trim());
  const totalCost = type === "upvote" ? upvoteCreditCost(qty) : SAVE_COST[type];

  async function generate() {
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/drafts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subreddit,
          targetUrl,
          tone: tone.toLowerCase(),
          length,
          existingText: body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate content.");
      if (data.title) setTitle(data.title);
      setBody(data.body || "");
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (type !== "upvote" && !body.trim()) {
      setError("Content is required.");
      return;
    }
    if (needsTargetUrl(type)) {
      if (!targetUrl.trim()) {
        setError(
          type === "upvote"
            ? "Paste the link to the post or comment to upvote."
            : "Paste the link to the Reddit thread you're replying to."
        );
        return;
      }
      if (!normalizeRedditUrl(targetUrl)) {
        setError("That doesn't look like a Reddit link. Paste the full URL.");
        return;
      }
    } else if (!subreddit.trim()) {
      setError("Subreddit is required.");
      return;
    }
    if (type === "upvote" && (!Number.isFinite(qty) || qty < MIN_UPVOTE_QTY)) {
      setError(`Minimum order is ${MIN_UPVOTE_QTY} upvotes.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subreddit: needsTargetUrl(type)
            ? undefined
            : subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`,
          title,
          body: type === "upvote" ? undefined : body,
          targetUrl: needsTargetUrl(type) ? targetUrl.trim() : undefined,
          qty: type === "upvote" ? qty : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save post.");
      setSavedInfo({ creditsCharged: data.creditsCharged, creditsRemaining: data.creditsRemaining });
      setTimeout(() => {
        router.push("/dashboard/drafts");
        router.refresh();
      }, 1400);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="section-tag">( create post )</span>
        <h2>Create a Reddit post</h2>
        <p className="section-sub">
          AI-assisted writing to help you create it, nothing here posts for
          you — copy the result and publish it yourself from your own
          account.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={type === t.key ? "btn btn-primary" : "btn btn-ghost"}
              style={{ fontSize: 13.5, padding: "8px 14px" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {savedInfo ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>✓ Saved to Track Task</div>
            <p style={{ color: "var(--text-dim)", margin: 0 }}>
              <strong style={{ color: "#ff8a8a" }}>−{savedInfo.creditsCharged} credits</strong>
              {typeof savedInfo.creditsRemaining === "number" && (
                <> · {savedInfo.creditsRemaining} credits remaining</>
              )}
            </p>
          </div>
        ) : (
        <form onSubmit={save} className="card" style={{ padding: 24 }}>
          {needsTargetUrl(type) ? (
            <label className="auth-field">
              <span>
                Link to the {type === "reply" ? "comment" : type === "upvote" ? "post or comment to upvote" : "thread"}{" "}
                <span style={{ color: "var(--accent)" }}>*</span>
              </span>
              <input
                type="url"
                inputMode="url"
                placeholder="https://www.reddit.com/r/SaaS/comments/…"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {type === "upvote"
                  ? "Whoever picks this up will upvote it from their own account."
                  : "Whoever posts this needs to know exactly where it goes."}
              </span>
            </label>
          ) : (
            <label className="auth-field">
              <span>Subreddit</span>
              <input
                type="text"
                placeholder="r/SaaS"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                required
              />
            </label>
          )}

          {type === "post" && (
            <label className="auth-field">
              <span>Post title</span>
              <input
                type="text"
                placeholder="A title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          )}

          {type === "upvote" && (
            <label className="auth-field">
              <span>
                Quantity <span style={{ color: "var(--accent)" }}>*</span>
              </span>
              <input
                type="number"
                min={MIN_UPVOTE_QTY}
                step={1}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10))}
                required
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                One Reddit account can only upvote a post once, so each upvote needs its own poster.
                Minimum order is {MIN_UPVOTE_QTY} — priced at 10 upvotes per credit.
              </span>
            </label>
          )}

          {type !== "upvote" && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
                  <span>Tone</span>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} style={selectStyle}>
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
                  <span>Length</span>
                  <select value={length} onChange={(e) => setLength(e.target.value)} style={selectStyle}>
                    {LENGTHS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={generate}
                className="btn btn-secondary"
                disabled={generating || !ready}
                style={{ marginBottom: 14 }}
              >
                {generating ? "Generating…" : body ? "Improve with AI ✨" : "Generate with AI ✨"}
              </button>

              <label className="auth-field">
                <span>Content</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 2000))}
                  rows={8}
                  placeholder="Write it yourself, or generate a starting point above"
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 15,
                    color: "var(--text)",
                    fontFamily: "inherit",
                    width: "100%",
                    resize: "vertical",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{body.length}/2000 characters</span>
              </label>
            </>
          )}

          {error && (
            <p role="alert" style={{ color: "#ff8a8a", marginBottom: 12, fontSize: 14 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => router.push("/dashboard/drafts")}>
              ← Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Creating…" : `Create Task (−${totalCost} credits) →`}
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
}
