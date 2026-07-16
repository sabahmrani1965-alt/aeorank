"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MentionsRefreshButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mentions/refresh", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not refresh.");
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={refresh} className="btn btn-primary" disabled={loading}>
        {loading ? "Searching Reddit…" : "Refresh mentions →"}
      </button>
      {error && (
        <p role="alert" style={{ color: "#ff8a8a", marginTop: 10, fontSize: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}
