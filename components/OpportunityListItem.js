"use client";

function tierColor(score) {
  if (score == null) return { fg: "var(--text-dim)", bg: "var(--state-neutral-bg)" };
  if (score >= 85) return { fg: "var(--state-success-fg)", bg: "var(--state-success-bg)" };
  if (score >= 60) return { fg: "var(--accent)", bg: "rgba(242,168,59,.15)" };
  return { fg: "var(--state-danger-fg)", bg: "var(--state-danger-bg)" };
}

// Compact row for the left-hand list — full detail lives in
// OpportunityDetailPane, this is scan-and-pick only.
export default function OpportunityListItem({ opportunity: o, freshness, isSelected, onSelect }) {
  const tier = tierColor(o.relevance_score);

  return (
    <button
      type="button"
      onClick={() => onSelect(o.id)}
      className={`opp-list-item${isSelected ? " is-selected" : ""}`}
    >
      <div className="opp-list-item-meta">
        <span>{o.sub}</span>
        {freshness && (
          <>
            <span>·</span>
            <span>{freshness}</span>
          </>
        )}
        {o.saved && <span className="opp-list-item-saved">★</span>}
      </div>
      <div className="opp-list-item-title">{o.title}</div>
      <div className="opp-list-item-footer">
        <span className="opp-list-item-score" style={{ color: tier.fg, background: tier.bg }}>
          {o.relevance_score ?? "-"}
        </span>
        {(o.ups > 0 || o.comments > 0) && (
          <span className="opp-list-item-stats">
            {o.ups > 0 && <span>↑ {o.ups.toLocaleString()}</span>}
            {o.comments > 0 && <span>💬 {o.comments.toLocaleString()}</span>}
          </span>
        )}
      </div>
    </button>
  );
}
