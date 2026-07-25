"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PosterPayoutControl({ posterId, pending }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(pending > 0 ? pending.toFixed(2) : "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function record() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posters/${posterId}/payouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not record this payout.");
      setOpen(false);
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm">
        Record payout
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={saving}
          style={{ width: 90, fontSize: 13, padding: "5px 8px" }}
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={saving}
          style={{ flex: 1, fontSize: 13, padding: "5px 8px" }}
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onClick={record} disabled={saving || !amount} className="btn btn-primary btn-sm">
          {saving ? "…" : "Confirm"}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={saving} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
      {error && (
        <span role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 12 }}>
          {error}
        </span>
      )}
    </div>
  );
}
