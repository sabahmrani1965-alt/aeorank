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
      <button type="button" className="btn btn-primary" onClick={run} disabled={loading}>
        {loading ? "Checking… (up to a minute)" : "Run a fresh check →"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", marginTop: 8, fontSize: 13.5 }}>
          {error}
        </p>
      )}
    </div>
  );
}
