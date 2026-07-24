"use client";

import { useState } from "react";

export default function AdminCreditAdjustForm() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { ok, text }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/credits/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: Number(amount), reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Adjustment failed.");
      setMessage({ ok: true, text: `Done. New balance: ${data.balance}.` });
      setAmount("");
      setReason("");
    } catch (err) {
      setMessage({ ok: false, text: err?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 20, maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>User email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          disabled={loading}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>
          Amount (positive = grant, negative = remove)
        </label>
        <input
          type="number"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50 or -20"
          disabled={loading}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Reason</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Support goodwill credit"
          disabled={loading}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading || !email || !amount}>
        {loading ? "Applying…" : "Apply adjustment"}
      </button>
      {message && (
        <p role="alert" style={{ color: message.ok ? "#7ee3a3" : "#ff8a8a", fontSize: 13.5, margin: 0 }}>
          {message.text}
        </p>
      )}
    </form>
  );
}
