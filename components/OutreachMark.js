"use client";

import { useState } from "react";

// Replied / Opted out buttons for one outreach contact on /admin/outreach.
export default function OutreachMark({ to, status }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function mark(next) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, status: next }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError((await res.json().catch(() => ({}))).error || "Couldn't save.");
    setBusy(false);
  }

  const btn = { padding: "5px 10px", fontSize: 13, borderRadius: 8, border: "1px solid var(--card-border)", background: "transparent", color: "var(--text)", cursor: "pointer" };
  if (status === "replied" || status === "optout") {
    return (
      <button type="button" style={btn} disabled={busy} onClick={() => mark("sent")}>
        Undo
      </button>
    );
  }
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      <button type="button" style={btn} disabled={busy} onClick={() => mark("replied")}>
        Replied
      </button>
      <button type="button" style={btn} disabled={busy} onClick={() => mark("optout")}>
        Opted out
      </button>
      {error ? <span style={{ color: "var(--danger)", fontSize: 13 }}>{error}</span> : null}
    </span>
  );
}
