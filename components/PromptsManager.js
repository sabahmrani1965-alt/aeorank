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
      <div className="pr-card pr-editing">
        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="op-textarea" aria-label="Prompt" />
        <div className="pr-edit-row">
          <select value={editType} onChange={(e) => setEditType(e.target.value)} className="op-select" aria-label="Type">
            {TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="op-select" aria-label="Location" />
          <button type="button" className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="op-btn op-btn-sm" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const hits = results?.length ? results.filter((r) => r.mentioned).length : null;
  const status = !prompt.last_checked_at
    ? { cls: "is-none", label: "Not checked yet" }
    : hits != null
      ? { cls: hits ? "is-good" : "is-bad", label: `Named by ${hits} of ${results.length} engines` }
      : { cls: prompt.last_mentioned ? "is-good" : "is-bad", label: prompt.last_mentioned ? "Named" : "Not named" };

  return (
    <article className="pr-card">
      <div className="pr-card-head">
        <div className="pr-card-main">
          <div className="pr-meta">
            <span className="pr-type-dot" style={{ background: TYPE_DOT[prompt.type] }} aria-hidden="true" />
            <span className="pr-type">{prompt.type}</span>
            <span>· {prompt.location}</span>
            <span>· Checked {timeAgo(prompt.last_checked_at)}</span>
          </div>
          <Link href={`/dashboard/prompts/${prompt.id}`} className="pr-text">
            {prompt.text}
          </Link>
        </div>
        <div className="pr-status">
          <span className={`pr-pill ${status.cls}`}>{status.label}</span>
          {prompt.last_position ? (
            <span className="pr-pill" style={{ background: posColors.bg, color: posColors.fg }}>
              Position #{prompt.last_position}
            </span>
          ) : null}
        </div>
      </div>

      {results?.length > 0 && (
        <div className="pr-engines">
          {results.map((r) => (
            <span key={r.model} className={`pr-engine ${r.mentioned ? "is-good" : "is-bad"}`} title={`${r.model}: ${r.mentioned ? "named you" : "did not name you"}`}>
              {r.mentioned ? "✓" : "✕"} {r.model}
              {r.position ? ` · #${r.position}` : ""}
            </span>
          ))}
        </div>
      )}

      {prompt.last_brands?.length > 0 && (
        <div className="pr-brands">
          <span className="pr-brands-label">Named instead:</span>
          {prompt.last_brands.slice(0, 8).map((b) => (
            <span key={b} className="pr-brand">
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="pr-actions">
        <button type="button" onClick={checkNow} disabled={checking} className="btn btn-primary btn-sm">
          {checking ? (
            <>
              <span className="loader" /> Checking… (up to a minute)
            </>
          ) : (
            "Check now"
          )}
        </button>
        {(results?.length > 0 || prompt.last_answer) && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="op-btn op-btn-sm" aria-expanded={expanded}>
            {expanded ? "Hide answers" : "Read the answers"}
          </button>
        )}
        <span className="pr-actions-spacer" />
        <button type="button" onClick={() => setEditing(true)} className="op-btn op-btn-sm op-btn-quiet">
          Edit
        </button>
        <button type="button" onClick={remove} disabled={deleting} className="op-btn op-btn-sm op-btn-quiet">
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {checkError && (
        <p role="alert" className="op-error">
          {checkError}
        </p>
      )}

      {expanded && results?.length > 0 && (
        <div className="pr-answers">
          {results.map((r) => (
            <div key={r.model} className="pr-answer">
              <div className="pr-answer-head">
                <strong>{r.model}</strong>
                {r.checkedAt ? <span>{timeAgo(r.checkedAt)}</span> : null}
                <span className={`pr-pill ${r.mentioned ? "is-good" : "is-bad"}`}>{r.mentioned ? `Named${r.position ? ` #${r.position}` : ""}` : "Not named"}</span>
              </div>
              <p>{r.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* No check this session yet — fall back to the single cached
          result from the last page load (prompts.last_* only ever holds
          one "primary" engine, see lib/aivisibility.js). */}
      {expanded && !results?.length && prompt.last_answer && (
        <div className="pr-answers">
          <div className="pr-answer">
            <div className="pr-answer-head">
              <strong>{prompt.last_model}</strong>
            </div>
            <p>{prompt.last_answer}</p>
          </div>
        </div>
      )}
    </article>
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
    <section className="pr-manager">
      <div className="pr-toolbar">
        <h2>
          Your prompts <span className="op-tab-n">{prompts.length}</span>
        </h2>
        {!showAddForm ? (
          <div className="pr-toolbar-actions">
            <button type="button" className="op-btn" onClick={suggestPromptsNow} disabled={suggesting}>
              {suggesting ? (
                <>
                  <span className="loader" /> Suggesting…
                </>
              ) : (
                "Suggest prompts"
              )}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
              + Add prompt
            </button>
          </div>
        ) : null}
      </div>

      {showAddForm ? (
        <form onSubmit={addPrompt} className="pr-card pr-add">
          <label className="pr-field">
            <span>The question a buyer would ask</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="What are the best SaaS tools for startups?" required className="op-textarea" />
          </label>
          <div className="pr-edit-row">
            <label className="pr-field">
              <span>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className="op-select">
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="pr-field">
              <span>Location</span>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Global" className="op-select" />
            </label>
          </div>
          <div className="pr-edit-row">
            <button type="submit" className="btn btn-primary btn-sm" disabled={adding || !text.trim()}>
              {adding ? "Adding…" : "Add prompt"}
            </button>
            <button type="button" className="op-btn op-btn-sm" onClick={() => setShowAddForm(false)} disabled={adding}>
              Cancel
            </button>
          </div>
          {addError && (
            <p role="alert" className="op-error">
              {addError}
            </p>
          )}
        </form>
      ) : null}

      {suggestError && (
        <p role="alert" className="op-error">
          {suggestError}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="pr-suggestions">
          <span className="pr-brands-label">Suggested, click to track:</span>
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => addSuggestion(s)} disabled={addingSuggestions.has(s)} className="pr-suggestion">
              {addingSuggestions.has(s) ? "Adding…" : `+ ${s}`}
            </button>
          ))}
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="pr-card pr-empty">No prompts yet. Add the questions your buyers ask, or let us suggest some.</div>
      ) : (
        <div className="pr-list">
          {prompts.map((p) => (
            <PromptRow key={p.id} prompt={p} initialResults={initialEngineResults?.[p.id]} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </section>
  );
}
