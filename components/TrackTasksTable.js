"use client";

import { useMemo, useState } from "react";

function shortId(id) {
  return (id || "").slice(0, 8);
}

function ViewOnRedditCell({ id, permalink }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(permalink || "");
  const [current, setCurrent] = useState(permalink || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permalink: value }),
      });
      if (res.ok) {
        setCurrent(value);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://reddit.com/..."
          style={{ fontSize: 13, padding: "5px 8px", width: 180 }}
          disabled={saving}
        />
        <button type="button" onClick={save} disabled={saving} className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 10px" }}>
          {saving ? "…" : "Save"}
        </button>
      </div>
    );
  }

  if (current) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a href={current} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13 }}>
          View on Reddit ↗
        </a>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          edit
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13, cursor: "pointer", padding: 0 }}
    >
      + Add link
    </button>
  );
}

function TaskRow({ task }) {
  const [expanded, setExpanded] = useState(false);
  const [posted, setPosted] = useState(task.posted);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function toggleMarked() {
    const next = !posted;
    setSaving(true);
    try {
      const res = await fetch(`/api/drafts/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posted: next }),
      });
      if (res.ok) setPosted(next);
    } finally {
      setSaving(false);
    }
  }

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(`${task.title}\n\n${task.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to.
    }
  }

  return (
    <>
      <tr style={{ borderBottom: expanded ? "none" : "1px solid var(--card-border-soft)" }}>
        <td style={{ padding: "10px 12px" }}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
              fontFamily: "ui-monospace, monospace",
              color: "var(--text-dim)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ display: "inline-block", transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
              ▸
            </span>
            {shortId(task.id)}
          </button>
        </td>
        <td style={{ padding: "10px 12px", fontSize: 13.5 }}>{task.subreddit}</td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              background: posted ? "rgba(110, 231, 183, 0.15)" : "rgba(255,255,255,.06)",
              color: posted ? "#6EE7B7" : "var(--text-dim)",
              whiteSpace: "nowrap",
            }}
          >
            {posted ? "Posted" : "Draft"}
          </span>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <ViewOnRedditCell id={task.id} permalink={task.permalink} />
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
          <td colSpan={4} style={{ padding: "4px 12px 16px" }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{task.title}</div>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0, marginBottom: 14, whiteSpace: "pre-wrap" }}>
                {task.body}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" onClick={copyContent} className="btn btn-secondary btn-sm">
                  {copied ? "Copied" : "Copy content"}
                </button>
                <button type="button" onClick={toggleMarked} disabled={saving} className="btn btn-secondary btn-sm">
                  {posted ? "✓ Marked as posted" : "Mark as posted"}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function TrackTasksTable({ tasks }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (status === "posted" && !t.posted) return false;
      if (status === "draft" && t.posted) return false;
      if (!q) return true;
      return (
        t.subreddit.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
      );
    });
  }, [tasks, search, status]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search subreddit or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 260px" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--card-border)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 14,
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        >
          <option value="all">All statuses</option>
          <option value="posted">Posted</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          No tasks match.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Task ID</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Subreddit</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Status</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>View on Reddit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
