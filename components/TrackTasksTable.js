"use client";

import { useMemo, useState } from "react";

const TYPE_LABELS = { post: "Post", reply: "Reply", comment: "Comment" };

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Status is derived entirely from whether a link is attached — never a
// separately-settable field, so it can't drift out of sync with reality.
function StatusBadge({ published }) {
  return published ? (
    <span className="tt-badge tt-badge-published">🟢 Published</span>
  ) : (
    <span className="tt-badge tt-badge-pending">🟡 Pending</span>
  );
}

function AddLinkForm({ id, onSaved }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!value.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permalink: value.trim() }),
      });
      if (!res.ok) throw new Error();
      onSaved(value.trim());
    } catch {
      setError("Could not save this link.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tt-add-link">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste the live Reddit link once you've posted it"
        disabled={saving}
      />
      <button type="button" onClick={save} disabled={saving || !value.trim()} className="btn btn-secondary btn-sm">
        {saving ? "Saving…" : "Save link"}
      </button>
      {error && <span style={{ color: "#ff8a8a", fontSize: 12.5 }}>{error}</span>}
    </div>
  );
}

function TaskRow({ task }) {
  const [expanded, setExpanded] = useState(false);
  const [permalink, setPermalink] = useState(task.permalink);
  const [postedAt, setPostedAt] = useState(task.posted_at);
  const [copied, setCopied] = useState(false);

  const published = Boolean(permalink);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(`${task.title}\n\n${task.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to.
    }
  }

  function handleSaved(link) {
    setPermalink(link);
    setPostedAt(new Date().toISOString());
  }

  return (
    <div className="tt-card">
      <button type="button" className="tt-row" onClick={() => setExpanded((v) => !v)}>
        <div className="tt-row-main">
          <span className={`tt-chevron${expanded ? " is-open" : ""}`}>▸</span>
          <span className="tt-subreddit">{task.subreddit}</span>
          <span className="tt-type">{TYPE_LABELS[task.type] || "Comment"}</span>
          <span className="tt-created">{formatDate(task.created_at)}</span>
          {!expanded && <span className="tt-snippet">{task.body}</span>}
        </div>
        <div className="tt-row-side">
          <StatusBadge published={published} />
          {published && (
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="tt-view-btn"
            >
              View ↗
            </a>
          )}
        </div>
      </button>

      {expanded && (
        <div className="tt-detail">
          <div className="tt-detail-title">{task.title}</div>
          <p className="tt-detail-body">{task.body}</p>

          <div className="tt-meta-grid">
            {task.type !== "post" && (
              <div>
                <div className="tt-meta-label">Replying to</div>
                {task.target_url ? (
                  <a href={task.target_url} target="_blank" rel="noopener noreferrer" className="tt-view-btn">
                    Thread ↗
                  </a>
                ) : (
                  <div className="tt-meta-value is-muted">Not set</div>
                )}
              </div>
            )}
            <div>
              <div className="tt-meta-label">Created</div>
              <div className="tt-meta-value">{formatDate(task.created_at) || "—"}</div>
            </div>
            <div>
              <div className="tt-meta-label">Published</div>
              <div className={`tt-meta-value${postedAt ? "" : " is-muted"}`}>
                {postedAt ? formatDate(postedAt) : "Not published yet"}
              </div>
            </div>
            <div>
              <div className="tt-meta-label">URL</div>
              {permalink ? (
                <a href={permalink} target="_blank" rel="noopener noreferrer" className="tt-view-btn">
                  View ↗
                </a>
              ) : (
                <div className="tt-meta-value is-muted">Not added yet</div>
              )}
            </div>
          </div>

          <div className="tt-actions">
            <button type="button" onClick={copyContent} className="btn btn-secondary btn-sm">
              {copied ? "Copied" : "Copy content"}
            </button>
            {!published && <AddLinkForm id={task.id} onSaved={handleSaved} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackTasksTable({ tasks }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const published = Boolean(t.permalink);
      if (status === "published" && !published) return false;
      if (status === "pending" && published) return false;
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
      <div className="tt-toolbar">
        <input
          type="text"
          placeholder="Search subreddit or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="tt-select">
          <option value="all">All statuses</option>
          <option value="published">🟢 Published</option>
          <option value="pending">🟡 Pending</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          No tasks match.
        </div>
      ) : (
        <div className="tt-list">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      )}
    </>
  );
}
