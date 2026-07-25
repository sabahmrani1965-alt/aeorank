"use client";

import { useState } from "react";

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.error || "Could not open billing portal.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="btn btn-primary"
        style={loading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
      >
        {loading ? "Redirecting…" : "Manage billing →"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", marginTop: 10, fontSize: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}
