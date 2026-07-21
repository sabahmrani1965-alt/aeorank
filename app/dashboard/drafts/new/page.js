"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CREDIT_COSTS } from "@/lib/credits";

const TYPES = [
  { key: "comment", label: "Post a Comment" },
  { key: "post", label: "Create a Post" },
  { key: "reply", label: "Reply to a Comment" },
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
  const [subreddit, setSubreddit] = useState(searchParams.get("subreddit") || "");
  const [threadContext, setThreadContext] = useState(searchParams.get("context") || "");
  const [tone, setTone] = useState("Helpful");
  const [length, setLength] = useState("medium");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInfo, setSavedInfo] = useState(null); // { creditsCharged, creditsRemaining }

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
          threadContext,
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
    if (!subreddit.trim() || !body.trim()) {
      setError("Subreddit and content are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subreddit: subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`,
          title: type === "post" ? title : title || threadContext,
          body,
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

          {type === "post" ? (
            <label className="auth-field">
              <span>Post title</span>
              <input
                type="text"
                placeholder="A title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          ) : (
            <label className="auth-field">
              <span>What's the thread/comment about?</span>
              <input
                type="text"
                placeholder="e.g. someone asking for a tool recommendation for X"
                value={threadContext}
                onChange={(e) => setThreadContext(e.target.value)}
              />
            </label>
          )}

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
            disabled={generating || !subreddit.trim()}
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
              {saving ? "Creating…" : `Create Task (−${SAVE_COST[type]} credits) →`}
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
}
