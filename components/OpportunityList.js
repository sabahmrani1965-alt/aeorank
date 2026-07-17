"use client";

import { useState } from "react";
import OpportunityCard from "./OpportunityCard";

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

// Owns which single card is expanded (shared across both the Saved and All
// sections) so opening one Quick Preview closes any other — coordinating
// this here is the only reason this needs to be a client component wrapper
// rather than each OpportunityCard managing its own expand state.
export default function OpportunityList({ saved, rest, competitors, analyzeCost }) {
  const [expandedId, setExpandedId] = useState(null);

  function renderCard(o) {
    return (
      <OpportunityCard
        key={o.id}
        opportunity={o}
        competitorMatch={findCompetitorMention(`${o.title} ${o.snippet || ""}`, competitors)}
        freshness={freshnessLabel(o.post_created_at)}
        analyzeCost={analyzeCost}
        isExpanded={expandedId === o.id}
        onToggleExpand={setExpandedId}
      />
    );
  }

  return (
    <>
      {saved.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 14 }}>Saved</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{saved.map(renderCard)}</div>
        </div>
      )}
      <div>
        {saved.length > 0 && <h3 style={{ marginBottom: 14 }}>All opportunities</h3>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{rest.map(renderCard)}</div>
      </div>
    </>
  );
}
