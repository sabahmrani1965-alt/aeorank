"use client";

import { useState } from "react";
import Link from "next/link";
import ScoreBadge from "./ScoreBadge";

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

export default function OpportunityCard({ opportunity: o, competitorMatch, freshness, analyzeCost, isExpanded, onToggleExpand }) {
  const [saved, setSaved] = useState(Boolean(o.saved));
  const [savingToggle, setSavingToggle] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
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
  // The deep "Quick Preview" call can return a better-grounded buying
  // intent than the shallow batch guess — kept in state so the pill
  // updates immediately rather than needing a page reload.
  const [buyingIntent, setBuyingIntent] = useState(o.buying_intent);

  const intent = intentColor(buyingIntent);
  const replyHref = `/dashboard/drafts/new?subreddit=${encodeURIComponent(o.sub || "")}&context=${encodeURIComponent(o.title || "")}`;
  const reasons = o.relevance_reasons?.length ? o.relevance_reasons : o.relevance_reason ? [o.relevance_reason] : [];
  const panelId = `opp-preview-${o.id}`;

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
      if (data.analysis?.buyingIntent) setBuyingIntent(data.analysis.buyingIntent);
    } catch (e) {
      setAnalyzeError(e?.message || "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleQuickPreview() {
    if (isExpanded) {
      onToggleExpand(null);
      return;
    }
    onToggleExpand(o.id);
    if (!analysis && !analyzing) {
      await analyze();
    }
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
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
                fontSize: 11.5,
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

      <a href={o.permalink} target="_blank" rel="noopener noreferrer" className="post-title" style={{ display: "block" }}>
        {o.title}
      </a>
      {o.snippet && <div className="opp-preview-clamp">{o.snippet}…</div>}

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
        <p style={{ marginTop: 6, marginBottom: 0, fontSize: 13, color: "var(--text-muted)" }}>
          Competitor mentioned: <strong style={{ color: "var(--text-dim)" }}>{competitorMatch}</strong>
        </p>
      )}

      {(o.ups > 0 || o.comments > 0) && (
        <div className="post-stats" style={{ marginTop: 12 }}>
          {o.ups > 0 && <span className="post-stat">↑ {o.ups.toLocaleString()}</span>}
          {o.comments > 0 && <span className="post-stat">💬 {o.comments.toLocaleString()}</span>}
        </div>
      )}

      <div className="opp-actions">
        <Link href={replyHref} className="btn btn-primary btn-sm">
          Generate Reply →
        </Link>
        <button
          type="button"
          onClick={handleQuickPreview}
          disabled={analyzing}
          className="btn btn-ghost btn-sm"
          aria-expanded={isExpanded}
          aria-controls={panelId}
        >
          {analyzing ? (
            <>
              <span className="loader" /> Analyzing…
            </>
          ) : isExpanded ? (
            "Hide preview"
          ) : analysis ? (
            "Quick Preview"
          ) : (
            `Quick Preview (${analyzeCost} credits)`
          )}
        </button>
        <button type="button" onClick={toggleSaved} disabled={savingToggle} className="btn btn-ghost btn-sm">
          {saved ? "★ Saved" : "☆ Save"}
        </button>
      </div>

      {analyzeError && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: 13.5, marginTop: 10 }}>
          {analyzeError}
        </p>
      )}

      <div id={panelId} className={`opp-expand${isExpanded ? " is-open" : ""}`}>
        <div className="opp-expand-inner">
          {isExpanded && analysis && (
            <div className="opp-expand-content">
              <div>
                <div style={labelStyle}>AI summary</div>
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
                  <div style={labelStyle}>Recommended reply angle</div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>{analysis.responseAngle}</p>
                </div>
              )}
              <button type="button" onClick={analyze} disabled={analyzing} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
                {analyzing ? "Re-analyzing…" : `Re-analyze (${analyzeCost} credits)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
