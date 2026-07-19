"use client";

import { useState } from "react";

// UI-only actions for a drafted Reddit post suggestion. Nothing here calls
// Reddit's API or publishes anything — "Copy" puts the draft on the
// clipboard and "Mark as posted" just records that the customer posted it
// manually from their own account. When draftId is set (logged-in visitor,
// or the dashboard drafts list) that status is persisted via PATCH; when
// it's null (anonymous visitor) it stays local-only, exactly as before.
export default function PostDraftActions({
  title,
  body,
  draftId = null,
  initialPosted = false,
  initialPermalink = "",
}) {
  const [copied, setCopied] = useState(false);
  const [marked, setMarked] = useState(initialPosted);
  const [saving, setSaving] = useState(false);
  const [permalink, setPermalink] = useState(initialPermalink || "");
  const [editingLink, setEditingLink] = useState(false);
  const [linkInput, setLinkInput] = useState(initialPermalink || "");
  const [savingLink, setSavingLink] = useState(false);

  async function copyDraft() {
    const text = `${title}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to, fail silently.
    }
  }

  async function toggleMarked() {
    const next = !marked;
    if (!draftId) {
      setMarked(next);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posted: next }),
      });
      if (res.ok) setMarked(next);
    } catch {
      // Leave local state unchanged on failure — button still reflects
      // the last confirmed server state, not an optimistic guess.
    } finally {
      setSaving(false);
    }
  }

  async function saveLink() {
    if (!draftId) return;
    setSavingLink(true);
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permalink: linkInput }),
      });
      if (res.ok) {
        setPermalink(linkInput);
        setEditingLink(false);
      }
    } catch {
      // Leave state unchanged on failure.
    } finally {
      setSavingLink(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={copyDraft}
        className="btn btn-secondary"
        style={{ fontSize: 13, padding: "8px 16px" }}
      >
        {copied ? "Copied" : "Copy draft"}
      </button>
      <button
        type="button"
        onClick={toggleMarked}
        disabled={saving}
        className="btn btn-secondary"
        style={{ fontSize: 13, padding: "8px 16px", opacity: saving ? 0.7 : 1 }}
      >
        {marked ? "✓ Marked as posted" : "Mark as posted"}
      </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>
          You post this yourself, from your own account.
        </span>
      </div>

      {draftId && marked && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Status:</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(110, 231, 183, 0.15)",
              color: "#6EE7B7",
            }}
          >
            Published
          </span>

          {editingLink ? (
            <>
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://reddit.com/..."
                disabled={savingLink}
                style={{ fontSize: 13, padding: "6px 10px", width: 220 }}
              />
              <button
                type="button"
                onClick={saveLink}
                disabled={savingLink}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                {savingLink ? "Saving…" : "Save link"}
              </button>
            </>
          ) : permalink ? (
            <>
              <a href={permalink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--accent)" }}>
                View live post ↗
              </a>
              <button
                type="button"
                onClick={() => {
                  setLinkInput(permalink);
                  setEditingLink(true);
                }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", padding: 0 }}
              >
                edit
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditingLink(true)}
              style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13, cursor: "pointer", padding: 0 }}
            >
              + Add live link
            </button>
          )}
        </div>
      )}
    </div>
  );
}
