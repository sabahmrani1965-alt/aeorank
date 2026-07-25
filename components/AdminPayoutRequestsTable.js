"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function RequestRow({ request }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function markPaid() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/payouts/${request.id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Could not mark this as paid.");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setBusy(false);
    }
  }

  async function dismiss() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/payouts/${request.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not dismiss this request.");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
      <td style={{ padding: "10px 12px" }}>{request.posterEmail}</td>
      <td style={{ padding: "10px 12px", fontWeight: 600 }}>${Number(request.amount).toFixed(2)}</td>
      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>{new Date(request.created_at).toLocaleDateString()}</td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={markPaid} disabled={busy} className="btn btn-primary btn-sm">
            {busy ? "…" : "Mark as paid"}
          </button>
          <button type="button" onClick={dismiss} disabled={busy} className="btn btn-ghost btn-sm">
            Dismiss
          </button>
        </div>
        {error && (
          <p role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 12, margin: "4px 0 0" }}>
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

export default function AdminPayoutRequestsTable({ requests }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
        No pending withdrawal requests.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Poster</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Amount</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Requested</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
