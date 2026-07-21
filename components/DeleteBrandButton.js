"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBrandButton({ brandId, brandName }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function del() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not delete this brand.");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="btn btn-ghost btn-sm">
        Delete this brand
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <p style={{ fontSize: 13.5, color: "var(--text-dim)", margin: 0 }}>
        Delete {brandName || "this brand"}? Its opportunities, mentions, prompts, reports, and tasks
        are deleted with it — this can't be undone.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={del} disabled={loading} className="btn btn-primary btn-sm">
          {loading ? "Deleting…" : "Yes, delete it"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} disabled={loading} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
