"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";

export default function DraftViewer({ taskId, initialTitle, initialBody, type }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const fullText = type === "post" && title ? `${title}\n\n${body}` : body;

  async function regenerate() {
    setError("");
    setRegenerating(true);
    try {
      const res = await fetch(`/api/poster/tasks/${taskId}/regenerate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate new content.");
      setTitle(data.title || title);
      setBody(data.body || body);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>
          Generated Content
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={regenerate} disabled={regenerating} className="btn btn-ghost btn-sm">
            {regenerating ? "Generating…" : "🔄 Generate another version"}
          </button>
          <CopyButton text={fullText} />
        </div>
      </div>
      <div className="kc-code-block">
        {type === "post" && title && <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>}
        {body}
      </div>
      {error && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13, margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
