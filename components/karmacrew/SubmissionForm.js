"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CHECKLIST = [
  { key: "rules", label: "Read rules" },
  { key: "copy", label: "Copy text" },
  { key: "publish", label: "Publish" },
  { key: "paste", label: "Paste Reddit URL" },
];

export default function SubmissionForm({ taskId, type, mode = "submit" }) {
  const router = useRouter();
  const [checked, setChecked] = useState({});
  const [permalink, setPermalink] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isResubmit = mode === "resubmit";
  const actionLabel = isResubmit ? "Resubmit" : "Submit";

  function toggle(key) {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/poster/tasks/${taskId}/${isResubmit ? "resubmit" : "submit"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "upvote" ? {} : { permalink }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit.");
      router.push("/poster/history");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (type === "upvote") {
    return (
      <form onSubmit={submit} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={confirmed} onChange={() => setConfirmed((v) => !v)} />
          I've upvoted it from my own Reddit account
        </label>

        <button type="submit" className="btn btn-primary btn-large" disabled={submitting || !confirmed}>
          {submitting ? `${actionLabel}ting…` : actionLabel}
        </button>

        {error && (
          <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13.5, margin: 0 }}>
            {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CHECKLIST.map((item) => (
          <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={Boolean(checked[item.key])} onChange={() => toggle(item.key)} />
            {item.label}
          </label>
        ))}
      </div>

      <label className="auth-field" style={{ marginBottom: 0 }}>
        <span>Paste Reddit Post URL</span>
        <textarea
          value={permalink}
          onChange={(e) => setPermalink(e.target.value)}
          rows={2}
          placeholder="https://reddit.com/r/.../comments/..."
          required
          style={{
            width: "100%",
            background: "var(--bg-3)",
            border: "1px solid var(--card-border)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 14,
            color: "var(--text)",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </label>

      <button type="submit" className="btn btn-primary btn-large" disabled={submitting || !permalink.trim()}>
        {submitting ? `${actionLabel}ting…` : actionLabel}
      </button>

      {error && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13.5, margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
