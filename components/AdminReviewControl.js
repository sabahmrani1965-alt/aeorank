"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReviewControl({ draftId }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision) {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/drafts/${draftId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not update.");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" onClick={() => decide("approve")} disabled={saving} className="btn btn-primary btn-sm">
        Approve
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
