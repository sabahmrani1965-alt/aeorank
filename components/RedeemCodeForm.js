"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RedeemCodeForm({ onRedeemed }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not redeem code.");
      if (onRedeemed) {
        onRedeemed();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13.5, cursor: "pointer", padding: 0 }}
      >
        Have a redeem code?
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={loading}
        style={{ maxWidth: 220 }}
      />
      <button type="submit" className="btn btn-secondary" disabled={loading || !code}>
        {loading ? "Checking…" : "Redeem"}
      </button>
      {error && (
        <p role="alert" style={{ width: "100%", color: "var(--state-danger-fg)", fontSize: 13.5, margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
