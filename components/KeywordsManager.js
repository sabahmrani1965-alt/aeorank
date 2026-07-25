"use client";

import { useState } from "react";

function timeAgo(iso) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function volumeColor(count) {
  if (count == null) return { bg: "var(--state-neutral-bg)", fg: "var(--text-dim)" };
  if (count === 0) return { bg: "var(--state-neutral-bg)", fg: "var(--text-dim)" };
  if (count >= 10) return { bg: "var(--state-success-bg)", fg: "var(--state-success-fg)" };
  return { bg: "var(--accent-dim)", fg: "var(--accent)" };
}

function KeywordRow({ item, onUpdated, onDeleted }) {
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const colors = volumeColor(item.last_post_count);

  async function refresh() {
    setCheckError("");
    setChecking(true);
    try {
      const res = await fetch(`/api/keywords/${item.id}/refresh`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not check this keyword.");
      onUpdated({
        ...item,
        last_checked_at: data.checkedAt,
        last_post_count: data.postCount,
        last_top_subreddits: data.topSubreddits,
        last_sample_posts: data.samplePosts,
      });
      setExpanded(true);
    } catch (e) {
      setCheckError(e?.message || "Something went wrong.");
    } finally {
      setChecking(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this keyword?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/keywords/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(item.id);
    } catch {
      setCheckError("Could not delete this keyword.");
      setDeleting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            {item.keyword}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Checked {timeAgo(item.last_checked_at)}</span>
            {item.last_top_subreddits?.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                · {item.last_top_subreddits.join(", ")}
              </span>
            )}
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            background: colors.bg,
            color: colors.fg,
            whiteSpace: "nowrap",
          }}
        >
          {item.last_checked_at == null
            ? "Not checked"
            : `${item.last_post_count ?? 0} post${item.last_post_count === 1 ? "" : "s"} found`}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
        <button type="button" onClick={refresh} disabled={checking} className="btn btn-primary btn-sm">
          {checking ? (
            <>
              <span className="loader" /> Checking…
            </>
          ) : (
            "Check now"
          )}
        </button>
        {item.last_sample_posts?.length > 0 && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="btn btn-ghost btn-sm">
            {expanded ? "Hide examples" : "View examples"}
          </button>
        )}
        <button type="button" onClick={remove} disabled={deleting} className="btn btn-ghost btn-sm">
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {checkError && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 13.5, marginTop: 10 }}>
          {checkError}
        </p>
      )}

      {expanded && item.last_sample_posts?.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--card-border-soft)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>
            Real Reddit posts found
          </div>
          {item.last_sample_posts.map((p) => (
            <a
              key={p.permalink}
              href={p.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", fontSize: 13.5, color: "var(--text)" }}
            >
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{p.sub}</span> · {p.title}{" "}
              <span style={{ color: "var(--text-muted)" }}>({p.ups} upvotes)</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KeywordsManager({ initialKeywords }) {
  const [keywords, setKeywords] = useState(initialKeywords || []);
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [addingSuggestions, setAddingSuggestions] = useState(() => new Set());

  async function suggestKeywordsNow() {
    setSuggestError("");
    setSuggesting(true);
    try {
      const res = await fetch("/api/keywords/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existing: keywords.map((k) => k.keyword) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate suggestions.");
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setSuggestError(err?.message || "Something went wrong.");
    } finally {
      setSuggesting(false);
    }
  }

  async function addSuggestion(suggestion) {
    setAddingSuggestions((prev) => new Set(prev).add(suggestion));
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: suggestion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not add this keyword.");
      setKeywords((prev) => [data.keyword, ...prev]);
      setSuggestions((prev) => prev.filter((s) => s !== suggestion));
    } catch (err) {
      setSuggestError(err?.message || "Something went wrong.");
    } finally {
      setAddingSuggestions((prev) => {
        const next = new Set(prev);
        next.delete(suggestion);
        return next;
      });
    }
  }

  async function addKeyword(e) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save this keyword.");
      setKeywords((prev) => [data.keyword, ...prev]);
      setKeyword("");
    } catch (err) {
      setAddError(err?.message || "Something went wrong.");
    } finally {
      setAdding(false);
    }
  }

  function handleUpdated(updated) {
    setKeywords((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
  }

  function handleDeleted(id) {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div>
      <form onSubmit={addKeyword} className="card" style={{ padding: 20, display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, maxWidth: 560 }}>
        <input
          type="text"
          className="input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="best AI visibility tool for SaaS"
          required
          style={{ flex: "1 1 240px" }}
        />
        <button type="submit" className="btn btn-primary" disabled={adding || !keyword.trim()}>
          {adding ? "Adding…" : "+ Add keyword"}
        </button>
      </form>

      {addError && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 13.5, marginBottom: 14 }}>
          {addError}
        </p>
      )}

      <div style={{ marginBottom: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={suggestKeywordsNow} disabled={suggesting}>
          {suggesting ? (
            <>
              <span className="loader" /> Analyzing your site & competitors…
            </>
          ) : (
            "✨ Suggest keywords from my website, description & competitors"
          )}
        </button>

        {suggestError && (
          <p role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 13.5, marginTop: 10 }}>
            {suggestError}
          </p>
        )}

        {suggestions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSuggestion(s)}
                disabled={addingSuggestions.has(s)}
                style={{
                  fontSize: 13,
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--card-border)",
                  background: "var(--bg-3)",
                  color: "var(--text)",
                  cursor: addingSuggestions.has(s) ? "default" : "pointer",
                  opacity: addingSuggestions.has(s) ? 0.6 : 1,
                }}
              >
                {addingSuggestions.has(s) ? "Adding…" : `+ ${s}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {keywords.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          No keywords yet. Add one above to help find better Reddit opportunities and see real conversation volume for it.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {keywords.map((k) => (
            <KeywordRow key={k.id} item={k} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
