"use client";

import { useState } from "react";
import Link from "next/link";

const TYPES = [
  { key: "commercial", label: "Commercial" },
  { key: "competitor", label: "Competitor" },
  { key: "branded", label: "Branded" },
];

const TYPE_DOT = { commercial: "#5AA9FF", competitor: "#D9C27A", branded: "#B084F0" };

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

function positionColor(position) {
  if (position == null) return { bg: "var(--state-neutral-bg)", fg: "var(--text-dim)" };
  if (position <= 3) return { bg: "var(--state-success-bg)", fg: "var(--state-success-fg)" };
  if (position <= 6) return { bg: "var(--accent-dim)", fg: "var(--accent)" };
  return { bg: "var(--state-danger-bg)", fg: "var(--state-danger-fg)" };
}

function PromptRow({ prompt, initialResults, onUpdated, onDeleted }) {
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [expanded, setExpanded] = useState(false);
  // Full per-engine breakdown — seeded from the latest stored row per
  // engine (fetched server-side in app/dashboard/prompts/page.js), then
  // replaced wholesale by the fresh results whenever "Check now" runs.
  const [results, setResults] = useState(initialResults || null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(prompt.text);
  const [editType, setEditType] = useState(prompt.type);
  const [editLocation, setEditLocation] = useState(prompt.location);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const posColors = positionColor(prompt.last_position);

  async function checkNow() {
    setCheckError("");
    setChecking(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/check`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not check this prompt.");
      setResults((data.results || []).map((r) => ({ ...r, checkedAt: data.checkedAt })));
      onUpdated({
        ...prompt,
        last_checked_at: data.checkedAt,
        last_mentioned: data.primary.mentioned,
        last_position: data.primary.position,
        last_brands: data.primary.brands,
        last_answer: data.primary.answer,
        last_model: data.primary.model,
      });
      setExpanded(true);
    } catch (e) {
      setCheckError(e?.message || "Something went wrong.");
    } finally {
      setChecking(false);
    }
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText, type: editType, location: editLocation }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save changes.");
      onUpdated({ ...prompt, text: editText, type: editType, location: editLocation });
      setEditing(false);
    } catch (e) {
      setCheckError(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this prompt?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(prompt.id);
    } catch {
      setCheckError("Could not delete this prompt.");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={2}
          style={{ width: "100%", background: "var(--bg-3)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "var(--text)", fontFamily: "inherit", resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={editType} onChange={(e) => setEditType(e.target.value)} style={{ background: "var(--bg-3)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 10px", fontSize: 13.5, color: "var(--text)" }}>
            {TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} style={{ width: 140 }} />
          <button type="button" className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_DOT[prompt.type], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>{prompt.type}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· {prompt.location}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· Checked {timeAgo(prompt.last_checked_at)}</span>
          </div>
          <Link href={`/dashboard/prompts/${prompt.id}`} style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", display: "block" }}>
            {prompt.text}
          </Link>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <span
            style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: posColors.bg, color: posColors.fg, whiteSpace: "nowrap" }}
          >
            {prompt.last_position ? `#${prompt.last_position}` : "-"}
          </span>
          {results?.length > 0 ? (
            (() => {
              const hits = results.filter((r) => r.mentioned).length;
              const good = hits > 0;
              return (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: good ? "var(--state-success-bg)" : "var(--state-danger-bg)",
                    color: good ? "var(--state-success-fg)" : "var(--state-danger-fg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hits}/{results.length} engines
                </span>
              );
            })()
          ) : (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 999,
                background: prompt.last_checked_at ? (prompt.last_mentioned ? "var(--state-success-bg)" : "var(--state-danger-bg)") : "var(--state-neutral-bg)",
                color: prompt.last_checked_at ? (prompt.last_mentioned ? "var(--state-success-fg)" : "var(--state-danger-fg)") : "var(--text-dim)",
                whiteSpace: "nowrap",
              }}
            >
              {!prompt.last_checked_at ? "Not checked" : prompt.last_mentioned ? "Mentioned" : "Not mentioned"}
            </span>
          )}
        </div>
      </div>

      {results?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {results.map((r) => (
            <span
              key={r.model}
              title={`${r.model}: ${r.mentioned ? "mentioned" : "not mentioned"}${r.position ? ` (#${r.position})` : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 999,
                background: r.mentioned ? "var(--state-success-bg)" : "var(--state-danger-bg)",
                color: r.mentioned ? "var(--state-success-fg)" : "var(--state-danger-fg)",
              }}
            >
              {r.mentioned ? "✓" : "✕"} {r.model}
              {r.position ? ` #${r.position}` : ""}
            </span>
          ))}
        </div>
      )}

      {prompt.last_brands?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {prompt.last_brands.map((b) => (
            <span key={b} style={{ fontSize: 12.5, background: "var(--bg-3)", padding: "4px 10px", borderRadius: 999, color: "var(--text-dim)" }}>
              {b}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
        <button type="button" onClick={checkNow} disabled={checking} className="btn btn-primary btn-sm">
          {checking ? (
            <>
              <span className="loader" /> Checking… (can take up to a minute)
            </>
          ) : (
            "Check now"
          )}
        </button>
        {(results?.length > 0 || prompt.last_answer) && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="btn btn-ghost btn-sm">
            {expanded ? "Hide answer" : "View answer"}
          </button>
        )}
        <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
          Edit
        </button>
        <button type="button" onClick={remove} disabled={deleting} className="btn btn-ghost btn-sm">
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {checkError && (
        <p role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 13.5, marginTop: 10 }}>
          {checkError}
        </p>
      )}

      {expanded && results?.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--card-border-soft)", display: "flex", flexDirection: "column", gap: 14 }}>
          {results.map((r) => {
            const rPos = positionColor(r.position);
            return (
              <div key={r.model}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)" }}>
                    {r.model}
                    {r.checkedAt ? ` · ${timeAgo(r.checkedAt)}` : ""}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: rPos.bg, color: rPos.fg }}>
                    {r.position ? `#${r.position}` : "-"}
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: r.mentioned ? "var(--state-success-bg)" : "var(--state-danger-bg)",
                      color: r.mentioned ? "var(--state-success-fg)" : "var(--state-danger-fg)",
                    }}
                  >
                    {r.mentioned ? "Mentioned" : "Not mentioned"}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>{r.answer}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* No check this session yet — fall back to the single cached
          result from the last page load (prompts.last_* only ever holds
          one "primary" engine, see lib/aivisibility.js). */}
      {expanded && !results?.length && prompt.last_answer && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--card-border-soft)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", marginBottom: 6 }}>
            {prompt.last_model}'s answer
          </div>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>{prompt.last_answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PromptsManager({ initialPrompts, initialEngineResults }) {
  const [prompts, setPrompts] = useState(initialPrompts || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState("commercial");
  const [location, setLocation] = useState("Global");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [addingSuggestions, setAddingSuggestions] = useState(() => new Set());

  async function addPrompt(e) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, location }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save this prompt.");
      setPrompts((prev) => [data.prompt, ...prev]);
      setText("");
      setType("commercial");
      setLocation("Global");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err?.message || "Something went wrong.");
    } finally {
      setAdding(false);
    }
  }

  async function suggestPromptsNow() {
    setSuggestError("");
    setSuggesting(true);
    try {
      const res = await fetch("/api/prompts/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existing: prompts.map((p) => p.text) }),
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
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: suggestion, type: "commercial", location: "Global" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not add this prompt.");
      setPrompts((prev) => [data.prompt, ...prev]);
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

  function handleUpdated(updated) {
    setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleDeleted(id) {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {showAddForm ? (
          <form onSubmit={addPrompt} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
            <label className="auth-field" style={{ marginBottom: 0 }}>
              <span>Prompt</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="What are the best SaaS tools for startups?"
                required
                style={{ width: "100%", background: "var(--bg-3)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "var(--text)", fontFamily: "inherit", resize: "vertical" }}
              />
            </label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
                <span>Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ background: "var(--bg-3)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "var(--text)" }}
                >
                  {TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
                <span>Location</span>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Global" />
              </label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={adding || !text.trim()}>
                {adding ? "Adding…" : "Add prompt"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)} disabled={adding}>
                Cancel
              </button>
            </div>
            {addError && (
              <p role="alert" style={{ color: "var(--state-danger-fg)", fontSize: 13.5, margin: 0 }}>
                {addError}
              </p>
            )}
          </form>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              + Add prompt
            </button>
            <button type="button" className="btn btn-ghost" onClick={suggestPromptsNow} disabled={suggesting}>
              {suggesting ? (
                <>
                  <span className="loader" /> Suggesting…
                </>
              ) : (
                "✨ Suggest prompts"
              )}
            </button>
          </div>
        )}

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

      {prompts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          No prompts yet. Add one above to start tracking your AI visibility for it.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {prompts.map((p) => (
            <PromptRow
              key={p.id}
              prompt={p}
              initialResults={initialEngineResults?.[p.id]}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
