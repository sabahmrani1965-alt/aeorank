"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Submitted (already posted/paid) tasks can't be deleted this way — see
// the DELETE handler in app/api/admin/drafts/[id]/route.js — so this
// button only ever renders for 'available'/'claimed' rows in the parent
// table.
export default function AdminDeleteDraftControl({ draftId }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/drafts/${draftId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not delete.");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
      <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-ghost btn-sm" style={{ color: "var(--state-danger-fg)" }}>
        {deleting ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <span role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 12 }}>
          {error}
        </span>
      )}
    </div>
  );
}
