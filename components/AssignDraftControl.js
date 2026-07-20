"use client";

import { useState } from "react";

export default function AssignDraftControl({ draftId, posters, initialClaimedBy }) {
  const [assignedTo, setAssignedTo] = useState(initialClaimedBy || "");
  const [pending, setPending] = useState(initialClaimedBy || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimed_by: pending || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not update assignment.");
      setAssignedTo(pending);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <select
        value={pending}
        onChange={(e) => setPending(e.target.value)}
        disabled={saving}
        style={{
          background: "var(--bg-3)",
          border: "1px solid var(--card-border)",
          borderRadius: 8,
          padding: "6px 8px",
          fontSize: 12.5,
          color: "var(--text)",
          fontFamily: "inherit",
        }}
      >
        <option value="">Unassigned</option>
        {posters.map((p) => (
          <option key={p.id} value={p.id}>
            {p.email}
          </option>
        ))}
      </select>
      {pending !== assignedTo && (
        <button type="button" onClick={save} disabled={saving} className="btn btn-ghost btn-sm">
          {saving ? "…" : "Save"}
        </button>
      )}
      {error && (
        <span role="alert" style={{ color: "#ff8a8a", fontSize: 12 }}>
          {error}
        </span>
      )}
    </div>
  );
}
