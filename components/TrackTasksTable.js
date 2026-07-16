"use client";

import { useMemo, useState } from "react";

function PermalinkCell({ id, permalink }) {
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
          View live ↗
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
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Date</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Subreddit</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Content</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Status</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Live link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
                  <td style={{ padding: "10px 12px", color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13.5 }}>{t.subreddit}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13.5, maxWidth: 360 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.title}</div>
                    <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.body}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: t.posted ? "rgba(110, 231, 183, 0.15)" : "rgba(255,255,255,.06)",
                        color: t.posted ? "#6EE7B7" : "var(--text-dim)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.posted ? "Posted" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <PermalinkCell id={t.id} permalink={t.permalink} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
