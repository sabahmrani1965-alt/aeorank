"use client";

import { useState } from "react";

// Shared fetch state for the tools backed by /api/tools/reddit/<tool>.
export function useRedditTool(tool) {
  const [state, setState] = useState({ status: "idle", data: null, error: "", query: "" });

  async function run(q) {
    setState({ status: "loading", data: null, error: "", query: q });
    try {
      const res = await fetch(`/api/tools/reddit/${tool}?q=${encodeURIComponent(q)}`);
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setState({ status: "done", data: j, error: "", query: q });
    } catch (e) {
      setState({ status: "error", data: null, error: e.message, query: q });
    }
  }

  return { ...state, run };
}

export function ToolForm({ id, label, placeholder, defaultValue = "", button, onSubmit, loading }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <form
      className="rt-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label htmlFor={id} className="tool-label">
        {label}
      </label>
      <div className="rt-form-row">
        <input id={id} className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} maxLength={80} />
        <button type="submit" className="btn btn-primary" disabled={loading || !value.trim()}>
          {loading ? "Checking…" : button}
        </button>
      </div>
    </form>
  );
}

export const fmt = (n) => (n == null ? "–" : new Intl.NumberFormat("en-US", { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n));

export const plural = (n, one, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;

export function ago(ms) {
  const d = Math.floor((Date.now() - ms) / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  return `${m} month${m > 1 ? "s" : ""} ago`;
}

export function ToolStatus({ status, error, loadingText }) {
  if (status === "loading") return <p className="rt-status" role="status">{loadingText}</p>;
  if (status === "error") return <p className="rt-status rt-error" role="alert">{error}</p>;
  return null;
}
