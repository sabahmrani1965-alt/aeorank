"use client";

import { useMemo, useState } from "react";
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

const TABS = [
  { key: "all", label: "All", test: () => true },
  { key: "high", label: "High intent", test: (o) => o.buying_intent === "high" },
  { key: "saved", label: "Saved", test: (o) => o.saved },
];

const SORTS = {
  relevance: (a, b) => (b.relevance_score ?? -1) - (a.relevance_score ?? -1),
  newest: (a, b) => (Date.parse(b.post_created_at) || 0) - (Date.parse(a.post_created_at) || 0),
  comments: (a, b) => (b.comments || 0) - (a.comments || 0),
};

// Two-pane layout: a filterable list on the left, the selected thread with
// its AI comment composer on the right. Saved and dismissed state is kept
// here so the list updates without a reload.
export default function OpportunityList({ opportunities, competitors, brandWebsite }) {
  const [items, setItems] = useState(opportunities);
  const [tab, setTab] = useState("all");
  const [sub, setSub] = useState("");
  const [sort, setSort] = useState("relevance");

  const subs = useMemo(() => {
    const counts = new Map();
    for (const o of items) counts.set(o.sub, (counts.get(o.sub) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const visible = useMemo(() => {
    const t = TABS.find((x) => x.key === tab) || TABS[0];
    return items.filter((o) => t.test(o) && (!sub || o.sub === sub)).sort(SORTS[sort]);
  }, [items, tab, sub, sort]);

  const [selectedId, setSelectedId] = useState(visible[0]?.id ?? null);
  const selected = visible.find((o) => o.id === selectedId) || visible[0] || null;

  function update(id, patch) {
    setItems((xs) => xs.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }
  function remove(id) {
    const i = visible.findIndex((o) => o.id === id);
    const next = visible[i + 1] || visible[i - 1] || null;
    setItems((xs) => xs.filter((o) => o.id !== id));
    setSelectedId(next?.id ?? null);
  }

  return (
    <div className="op-split">
      <div className="op-list-col">
        <div className="op-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`op-tab${tab === t.key ? " is-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} <span className="op-tab-n">{items.filter(t.test).length}</span>
            </button>
          ))}
        </div>

        <div className="op-filters">
          <label>
            <span className="sr-only">Subreddit</span>
            <select value={sub} onChange={(e) => setSub(e.target.value)} className="op-select">
              <option value="">All subreddits</option>
              {subs.map(([s, n]) => (
                <option key={s} value={s}>
                  {s} ({n})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="op-select">
              <option value="relevance">Most relevant</option>
              <option value="newest">Newest</option>
              <option value="comments">Most comments</option>
            </select>
          </label>
        </div>

        <div className="op-list">
          {visible.length === 0 ? (
            <p className="op-empty">{tab === "saved" ? "No saved threads yet. Use Save on a thread to keep it here." : "No threads match these filters."}</p>
          ) : (
            visible.map((o) => (
              <OpportunityListItem key={o.id} opportunity={o} isSelected={selected?.id === o.id} onSelect={setSelectedId} />
            ))
          )}
        </div>
      </div>

      <div className="op-detail-col">
        {selected ? (
          <OpportunityDetailPane
            key={selected.id}
            opportunity={selected}
            brandWebsite={brandWebsite}
            competitorMatch={findCompetitorMention(`${selected.title} ${selected.snippet || ""}`, competitors)}
            onSavedChange={(saved) => update(selected.id, { saved })}
            onDismissed={() => remove(selected.id)}
          />
        ) : (
          <div className="op-detail op-detail-empty">Select a thread to see why it fits and draft a comment.</div>
        )}
      </div>
    </div>
  );
}
