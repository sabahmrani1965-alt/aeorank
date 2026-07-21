"use client";

import { useState } from "react";
import OpportunityListItem from "./OpportunityListItem";
import OpportunityDetailPane from "./OpportunityDetailPane";

// company_profiles.competitors stores competitor URLs, not clean brand
// names — reduce a URL to its bare domain label so it can be matched
// against plain-text post titles/snippets (nobody writes full URLs in a
// casual Reddit post title).
function domainLabel(url) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").split(".")[0] || "";
  } catch {
    return "";
  }
}

function findCompetitorMention(text, competitors) {
  if (!text || !competitors?.length) return null;
  const compact = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const c of competitors) {
    const label = domainLabel(c).toLowerCase();
    if (label.length >= 3 && compact.includes(label)) return label;
  }
  return null;
}

function freshnessLabel(postCreatedAt) {
  if (!postCreatedAt) return null;
  const hours = (Date.now() - new Date(postCreatedAt).getTime()) / 3600000;
  if (hours < 24) return "New";
  if (hours < 24 * 7) return "This week";
  return "Older";
}

// Two-pane layout: a compact scrollable list on the left, full detail +
// inline draft-and-create-task composer on the right for whichever
// opportunity is selected. Defaults to the first item so the pane is never
// empty on load.
export default function OpportunityList({ saved, rest, competitors, analyzeCost }) {
  const all = [...saved, ...rest];
  const [selectedId, setSelectedId] = useState(all[0]?.id ?? null);
  const selected = all.find((o) => o.id === selectedId) || null;

  function renderItem(o) {
    return (
      <OpportunityListItem
        key={o.id}
        opportunity={o}
        freshness={freshnessLabel(o.post_created_at)}
        isSelected={selectedId === o.id}
        onSelect={setSelectedId}
      />
    );
  }

  return (
    <div className="opp-split">
      <div className="opp-list-col">
        {saved.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 className="opp-list-col-heading">Saved</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{saved.map(renderItem)}</div>
          </div>
        )}
        <div>
          {saved.length > 0 && <h3 className="opp-list-col-heading">All opportunities</h3>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{rest.map(renderItem)}</div>
        </div>
      </div>

      <div className="opp-detail-col">
        {selected ? (
          <OpportunityDetailPane
            key={selected.id}
            opportunity={selected}
            competitorMatch={findCompetitorMention(`${selected.title} ${selected.snippet || ""}`, competitors)}
            freshness={freshnessLabel(selected.post_created_at)}
            analyzeCost={analyzeCost}
          />
        ) : (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)", padding: 32 }}>
            Select an opportunity to see details.
          </div>
        )}
      </div>
    </div>
  );
}
