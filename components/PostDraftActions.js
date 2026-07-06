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
}) {
  const [copied, setCopied] = useState(false);
  const [marked, setMarked] = useState(initialPosted);
  const [saving, setSaving] = useState(false);

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

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
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
  );
}
