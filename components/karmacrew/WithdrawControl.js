"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/posterPay";

export default function WithdrawControl({ pending }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(pending > 0 ? pending.toFixed(2) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const belowMinimum = pending < MIN_WITHDRAWAL_AMOUNT;

  async function submit(e) {
    e.preventDefault();
    setError("");
    const value = Number(amount);
    if (value < MIN_WITHDRAWAL_AMOUNT) {
      setError(`Minimum withdrawal is $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/poster/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit your withdrawal request.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p style={{ color: "var(--msg-success)", fontSize: 13.5, margin: 0 }}>Withdrawal requested — an admin will process it soon.</p>;
  }

  if (!open) {
    return (
      <div>
        <button type="button" onClick={() => setOpen(true)} disabled={belowMinimum} className="btn btn-primary">
          Withdraw
        </button>
        {belowMinimum && (
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>
            Minimum withdrawal is ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)} — you have ${pending.toFixed(2)} pending.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
      <label className="auth-field" style={{ marginBottom: 0 }}>
        <span>
          Amount (${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}–${pending.toFixed(2)})
        </span>
        <input
          type="number"
          step="0.01"
          min={MIN_WITHDRAWAL_AMOUNT}
          max={pending}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={submitting}
          required
        />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !amount}>
          {submitting ? "Submitting…" : "Request withdrawal"}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13, margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
