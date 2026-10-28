"use client";

import { ago, cleanPostText, intentLabel, scoreTier } from "./opportunityFormat";

// One row in the left-hand list: enough to judge a thread without opening
// it (subreddit, age, title, a line of the post, score, intent, comments).
export default function OpportunityListItem({ opportunity: o, isSelected, onSelect }) {
  const tier = scoreTier(o.relevance_score);
  const intent = intentLabel(o.buying_intent);
  const snippet = cleanPostText(o.snippet, o.title);
  return (
    <button type="button" onClick={() => onSelect(o.id)} className={`op-item${isSelected ? " is-selected" : ""}`} aria-pressed={isSelected}>
      <span className="op-item-meta">
        <span>{o.sub}</span>
        {o.post_created_at ? <span>· {ago(o.post_created_at)}</span> : null}
        {o.saved ? (
          <span className="op-item-saved" aria-label="Saved">
            ★
          </span>
        ) : null}
      </span>
      <span className="op-item-title">{o.title}</span>
      {snippet ? <span className="op-item-snippet">{snippet}</span> : null}
      <span className="op-item-foot">
        <span className={`op-score ${tier.cls}`}>{o.relevance_score ?? "–"}</span>
        {intent ? <span className={`op-intent ${intent.cls}`}>{intent.label}</span> : null}
        {o.cited_by?.length ? <span className="op-cited-badge">Cited by {o.cited_by.join(", ")}</span> : null}
        {o.comments > 0 ? (
          <span className="op-item-comments" aria-label={`${o.comments} comments`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {o.comments.toLocaleString()}
          </span>
        ) : null}
      </span>
    </button>
  );
}
