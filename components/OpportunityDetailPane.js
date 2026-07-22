"use client";

import { useState } from "react";
import Link from "next/link";
import ScoreBadge from "./ScoreBadge";
import { CREDIT_COSTS } from "@/lib/credits";
import { normalizeRedditUrl } from "@/lib/format";

const TONES = ["Helpful", "Casual", "Expert", "Enthusiastic"];
const LENGTHS = [
  { key: "short", label: "Short" },
  { key: "medium", label: "Medium" },
  { key: "long", label: "Long" },
];
const SAVE_COST = CREDIT_COSTS.generate_comment;

function intentColor(intent) {
  if (intent === "high") return { bg: "rgba(110, 231, 183, 0.15)", fg: "#6EE7B7" };
  if (intent === "medium") return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  if (intent === "low") return { bg: "rgba(255,255,255,.06)", fg: "var(--text-dim)" };
  return null;
}

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  color: "var(--text-muted)",
  marginBottom: 6,
};

// Full detail + inline "draft and create a task" composer for whichever
// opportunity is selected in the left list. Always drafts a top-level
// *comment* on the thread (not "reply" or "post") — an opportunity IS a
// Reddit post, so responding to it is inherently commenting on it; there's
// no separate comment-id to target the way a true "reply" would need.
export default function OpportunityDetailPane({ opportunity: o, competitorMatch, freshness }) {
  const [saved, setSaved] = useState(Boolean(o.saved));
  const [savingToggle, setSavingToggle] = useState(false);

  const buyingIntent = o.buying_intent;

  const [tone, setTone] = useState("Helpful");
  const [length, setLength] = useState("medium");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedInfo, setSavedInfo] = useState(null);

  const intent = intentColor(buyingIntent);
  const reasons = o.relevance_reasons?.length ? o.relevance_reasons : o.relevance_reason ? [o.relevance_reason] : [];
  const targetUrl = normalizeRedditUrl(o.permalink);

  async function toggleSaved() {
    const next = !saved;
    setSaved(next);
    setSavingToggle(true);
    try {
      const res = await fetch(`/api/opportunities/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSaved(!next);
    } finally {
      setSavingToggle(false);
    }
  }

  async function generateComment() {
    setGenerateError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/drafts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          subreddit: o.sub,
          threadContext: o.title,
          tone: tone.toLowerCase(),
          length,
          existingText: body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not generate content.");
      setBody(data.body || "");
    } catch (e) {
      setGenerateError(e?.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  async function createTask() {
    setSaveError("");
    if (!body.trim()) {
      setSaveError("Generate or write a comment first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          subreddit: o.sub.startsWith("r/") ? o.sub : `r/${o.sub}`,
          title: o.title,
          body,
          targetUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save this task.");
      setSavedInfo({ creditsCharged: data.creditsCharged, creditsRemaining: data.creditsRemaining });
    } catch (e) {
      setSaveError(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="opp-detail">
      <div className="opp-detail-header">
        <div className="post-meta" style={{ marginBottom: 0 }}>
          <span>{o.sub}</span>
          {freshness && (
            <>
              <span>·</span>
              <span>{freshness}</span>
            </>
          )}
          {intent && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 999,
                background: intent.bg,
                color: intent.fg,
                textTransform: "capitalize",
              }}
            >
              {buyingIntent} intent
            </span>
          )}
        </div>
        <ScoreBadge score={o.relevance_score} />
      </div>

      <h2 className="opp-detail-title">{o.title}</h2>

      <div className="opp-detail-actions">
        <a href={o.permalink} target="_blank" rel="noopener noreferrer" className="tt-view-btn">
          View on Reddit ↗
        </a>
        <button type="button" onClick={toggleSaved} disabled={savingToggle} className="btn btn-ghost btn-sm">
          {saved ? "★ Saved" : "☆ Save"}
        </button>
        {(o.ups > 0 || o.comments > 0) && (
          <span className="post-stats">
            {o.ups > 0 && <span className="post-stat">↑ {o.ups.toLocaleString()}</span>}
            {o.comments > 0 && <span className="post-stat">💬 {o.comments.toLocaleString()}</span>}
          </span>
        )}
      </div>

      {reasons.length > 0 && (
        <div className="opp-why">
          <div className="opp-why-title">Why AEOrank recommends this</div>
          {reasons.slice(0, 5).map((r, i) => (
            <div key={i} className="opp-why-item">
              <span className="opp-why-check" aria-hidden="true">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      {competitorMatch && (
        <p style={{ marginTop: 6, marginBottom: 0, fontSize: 14.5, color: "var(--text-muted)" }}>
          Competitor mentioned: <strong style={{ color: "var(--text-dim)" }}>{competitorMatch}</strong>
        </p>
      )}

      <div className="opp-composer">
        <div style={labelStyle}>Draft a comment</div>

        {savedInfo ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>✓ Saved to Track Task</div>
            <p style={{ color: "var(--text-dim)", margin: "0 0 14px" }}>
              <strong style={{ color: "#ff8a8a" }}>−{savedInfo.creditsCharged} credits</strong>
              {typeof savedInfo.creditsRemaining === "number" && (
                <> · {savedInfo.creditsRemaining} credits remaining</>
              )}
            </p>
            <Link href="/dashboard/drafts" className="btn btn-ghost btn-sm">
              View in Track Tasks →
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
                <span>Tone</span>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="opp-select">
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="auth-field" style={{ flex: "1 1 160px", marginBottom: 0 }}>
                <span>Length</span>
                <select value={length} onChange={(e) => setLength(e.target.value)} className="opp-select">
                  {LENGTHS.map((l) => (
                    <option key={l.key} value={l.key}>{l.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={generateComment}
              disabled={generating}
              className="btn btn-secondary"
              style={{ marginBottom: 14 }}
            >
              {generating ? "Generating…" : body ? "Regenerate with AI ✨" : "Generate Comment ✨"}
            </button>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 2000))}
              rows={7}
              placeholder="Write it yourself, or generate a starting point above"
              className="opp-textarea"
            />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{body.length}/2000 characters</span>

            {generateError && (
              <p role="alert" style={{ color: "#ff8a8a", fontSize: 14.5, marginTop: 8 }}>
                {generateError}
              </p>
            )}
            {saveError && (
              <p role="alert" style={{ color: "#ff8a8a", fontSize: 14.5, marginTop: 8 }}>
                {saveError}
              </p>
            )}

            <div style={{ marginTop: 14 }}>
              <button type="button" onClick={createTask} disabled={saving} className="btn btn-primary">
                {saving ? "Saving…" : `Create Task (−${SAVE_COST} credits) →`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
