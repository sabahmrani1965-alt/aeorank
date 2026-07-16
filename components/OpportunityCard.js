"use client";

import { useState } from "react";
import Link from "next/link";

function scoreColor(score) {
  if (score == null) return { bg: "rgba(255,255,255,.06)", fg: "var(--text-dim)" };
  if (score >= 80) return { bg: "rgba(110, 231, 183, 0.15)", fg: "#6EE7B7" };
  if (score >= 50) return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  return { bg: "rgba(255, 120, 120, 0.12)", fg: "#ff8a8a" };
}

function intentColor(intent) {
  if (intent === "high") return { bg: "rgba(110, 231, 183, 0.15)", fg: "#6EE7B7" };
  if (intent === "medium") return { bg: "rgba(242, 168, 59, 0.15)", fg: "var(--accent)" };
  if (intent === "low") return { bg: "rgba(255,255,255,.06)", fg: "var(--text-dim)" };
  return null;
}

const labelStyle = {
  fontSize: 12.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  color: "var(--text-muted)",
  marginBottom: 4,
};

export default function OpportunityCard({ opportunity: o, competitorMatch, freshness, analyzeCost }) {
  const [saved, setSaved] = useState(Boolean(o.saved));
  const [savingToggle, setSavingToggle] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState(
    o.analyzed_at
      ? {
          summary: o.analysis_summary,
          painPoints: o.analysis_pain_points || [],
          competitorsMentioned: o.analysis_competitors_mentioned || [],
          responseAngle: o.analysis_response_angle,
        }
      : null
  );

  const colors = scoreColor(o.relevance_score);
  const intent = intentColor(o.buying_intent);
  const draftHref = `/dashboard/drafts/new?subreddit=${encodeURIComponent(o.sub || "")}&context=${encodeURIComponent(o.title || "")}`;

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

  async function analyze() {
    setAnalyzeError("");
    setAnalyzing(true);
    try {
      const res = await fetch("/api/opportunities/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: o.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not analyze this thread.");
      setAnalysis(data.analysis);
      setExpanded(true);
    } catch (e) {
      setAnalyzeError(e?.message || "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        <div className="post-meta">
          <span>{o.sub}</span>
          {freshness && (
            <>
              <span>·</span>
              <span>{freshness}</span>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {o.relevance_score != null && (
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: colors.bg, color: colors.fg, whiteSpace: "nowrap" }}>
              Score: {o.relevance_score}/100
            </span>
          )}
          {intent && (
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: intent.bg, color: intent.fg, whiteSpace: "nowrap", textTransform: "capitalize" }}>
              {o.buying_intent} intent
            </span>
          )}
        </div>
      </div>

      <a href={o.permalink} target="_blank" rel="noopener noreferrer" className="post-title" style={{ display: "block" }}>
        {o.title}
      </a>
      {o.snippet && <div className="post-snippet">{o.snippet}…</div>}
      {(o.ups > 0 || o.comments > 0) && (
        <div className="post-stats">
          {o.ups > 0 && <span className="post-stat">↑ {o.ups.toLocaleString()}</span>}
          {o.comments > 0 && <span className="post-stat">💬 {o.comments.toLocaleString()}</span>}
        </div>
      )}
      {o.relevance_reason && (
        <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{o.relevance_reason}</p>
      )}
      {competitorMatch && (
        <p style={{ marginTop: 6, fontSize: 13, color: "var(--text-muted)" }}>
          Competitor mentioned: <strong style={{ color: "var(--text-dim)" }}>{competitorMatch}</strong>
        </p>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <Link href={draftHref} className="btn btn-primary btn-sm">
          Generate draft →
        </Link>
        <button type="button" onClick={toggleSaved} disabled={savingToggle} className="btn btn-ghost btn-sm">
          {saved ? "★ Saved" : "☆ Save"}
        </button>
        {!analysis && (
          <button type="button" onClick={analyze} disabled={analyzing} className="btn btn-ghost btn-sm">
            {analyzing ? (
              <>
                <span className="loader" /> Analyzing…
              </>
            ) : (
              `Analyze thread (${analyzeCost} credits)`
            )}
          </button>
        )}
        {analysis && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="btn btn-ghost btn-sm">
            {expanded ? "Hide analysis" : "View analysis"}
          </button>
        )}
      </div>

      {analyzeError && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, marginTop: 10 }}>
          {analyzeError}
        </p>
      )}

      {analysis && expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--card-border-soft)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={labelStyle}>Discussion summary</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>{analysis.summary}</p>
          </div>
          {analysis.painPoints?.length > 0 && (
            <div>
              <div style={labelStyle}>Pain points</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>
                {analysis.painPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.competitorsMentioned?.length > 0 && (
            <div>
              <div style={{ ...labelStyle, marginBottom: 6 }}>Competitors mentioned</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {analysis.competitorsMentioned.map((c) => (
                  <span key={c} style={{ fontSize: 12.5, background: "var(--bg-3)", padding: "4px 10px", borderRadius: 999, color: "var(--text-dim)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.responseAngle && (
            <div>
              <div style={labelStyle}>Recommended response angle</div>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>{analysis.responseAngle}</p>
            </div>
          )}
          <button
            type="button"
            onClick={analyze}
            disabled={analyzing}
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: "flex-start" }}
          >
            {analyzing ? "Re-analyzing…" : `Re-analyze (${analyzeCost} credits)`}
          </button>
        </div>
      )}
    </div>
  );
}
