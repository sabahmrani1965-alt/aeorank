"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { key: "", label: "All types" },
  { key: "usage", label: "Usage" },
  { key: "purchase", label: "Purchase" },
  { key: "renewal", label: "Renewal" },
  { key: "refund", label: "Refund" },
  { key: "grant", label: "Grant" },
  { key: "removal", label: "Removal" },
];

const fieldStyle = {
  background: "var(--bg-3)",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 13.5,
  color: "var(--text)",
  fontFamily: "inherit",
};

export default function TransactionFilters({ exportHref }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  function apply(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/dashboard/credits/history?${params.toString()}`);
  }

  function clear() {
    setQ("");
    setType("");
    setFrom("");
    setTo("");
    router.push("/dashboard/credits/history");
  }

  const hasFilters = q || type || from || to;

  return (
    <form onSubmit={apply} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Search description or action…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ ...fieldStyle, flex: "1 1 220px" }}
      />
      <select value={type} onChange={(e) => setType(e.target.value)} style={fieldStyle}>
        {TYPES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={fieldStyle} aria-label="From date" />
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={fieldStyle} aria-label="To date" />
      <button type="submit" className="btn btn-secondary btn-sm">
        Filter
      </button>
      {hasFilters && (
        <button type="button" onClick={clear} className="btn btn-ghost btn-sm">
          Clear
        </button>
      )}
      <a href={exportHref} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
        Export CSV ↓
      </a>
    </form>
  );
}
