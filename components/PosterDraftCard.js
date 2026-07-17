"use client";

import { useState } from "react";

export default function PosterDraftCard({ draft }) {
  const [copied, setCopied] = useState(false);
  const [permalink, setPermalink] = useState(draft.permalink || "");
  const [completed, setCompleted] = useState(draft.posted);
  const [savedPermalink, setSavedPermalink] = useState(draft.permalink || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function copyDraft() {
    const text = `${draft.title}\n\n${draft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to.
    }
  }

  async function complete() {
    setError("");
    if (!permalink.trim()) {
      setError("Paste the live Reddit link before marking this complete.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/poster/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permalink }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not mark this complete.");
      setCompleted(true);
      setSavedPermalink(permalink);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="reddit-mock">
        <div className="reddit-mock-meta">
          {draft.subreddit} · {draft.companyName || "Unknown company"}
        </div>
        <div className="reddit-mock-title">{draft.title}</div>
        <div className="reddit-mock-body">{draft.body}</div>

        {completed ? (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#7ee3a3", fontSize: 13.5, fontWeight: 600 }}>✓ Completed</span>
            {savedPermalink && (
              <a href={savedPermalink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
                View live ↗
              </a>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={copyDraft} className="btn btn-secondary btn-sm">
              {copied ? "Copied" : "Copy draft"}
            </button>
            <input
              type="text"
              placeholder="Live Reddit link, once posted"
              value={permalink}
              onChange={(e) => setPermalink(e.target.value)}
              disabled={saving}
              style={{ flex: "1 1 220px" }}
            />
            <button type="button" onClick={complete} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? "Saving…" : "Mark completed"}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" style={{ color: "#ff8a8a", fontSize: 13, marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
