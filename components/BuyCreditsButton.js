"use client";

import { useState } from "react";

export default function BuyCreditsButton({ packageId, className, children, style }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.error || "Could not start checkout.");
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
        onClick={buy}
        disabled={loading}
        className={className || "btn btn-secondary"}
        style={loading ? { ...style, opacity: 0.7, cursor: "not-allowed" } : style}
      >
        {loading ? "Redirecting…" : children || "Buy"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", marginTop: 8, fontSize: 13 }}>
          {error}
        </p>
      )}
    </div>
  );
}
