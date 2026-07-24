"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AiVisibilityRecheckButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function run() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reports/ai-visibility", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate the report.");
      router.push(`/dashboard/reports/${data.reportId}`);
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-secondary" onClick={run} disabled={loading}>
        {loading ? "Checking…" : "Re-check my brand's AI visibility"}
      </button>
      {error && (
        <p role="alert" style={{ color: "#ff8a8a", marginTop: 8, fontSize: 13.5 }}>
          {error}
        </p>
      )}
    </div>
  );
}
