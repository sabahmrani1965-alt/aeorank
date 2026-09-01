"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReviewControl({ draftId }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision, note) {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/drafts/${draftId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not update.");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setSaving(false);
    }
  }

  function requestChanges() {
    const note = window.prompt("What does the poster need to fix before resubmitting?");
    if (note === null) return; // cancelled
    if (!note.trim()) {
      setError("A note is required so the poster knows what to fix.");
      return;
    }
    decide("request_changes", note.trim());
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" onClick={() => decide("approve")} disabled={saving} className="btn btn-primary btn-sm">
        Approve
      </button>
      <button type="button" onClick={requestChanges} disabled={saving} className="btn btn-ghost btn-sm">
        Request changes
      </button>
      <button type="button" onClick={() => decide("reject")} disabled={saving} className="btn btn-ghost btn-sm">
        Reject
      </button>
      {error && (
        <span role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 12 }}>
          {error}
        </span>
      )}
    </div>
  );
}
