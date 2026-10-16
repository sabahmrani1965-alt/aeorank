"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ago, cleanPostText } from "./opportunityFormat";

const DAY = 86400000;
const PERIODS = [
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "all", label: "All time", days: null },
];
const SENTS = ["positive", "neutral", "negative"];
const SENT_LABEL = { positive: "Positive", neutral: "Neutral", negative: "Negative" };
const SENT_COLOR = { positive: "var(--state-success-fg)", neutral: "var(--accent)", negative: "var(--state-danger-fg)" };

const ts = (m) => Date.parse(m.post_created_at) || 0;
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function Highlight({ text, terms }) {
  // Longest first, so "SaaSOffers.tech" is marked whole, not as "SaaSOffers".
  const words = terms.map((t) => t.trim()).filter((t) => t.length >= 3).sort((a, b) => b.length - a.length);
  if (!words.length || !text) return text || null;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i} className="mn-mark">{part}</mark> : part));
}

function SentimentPill({ value }) {
  if (!value) return <span className="mn-pill is-none">Unscored</span>;
  return <span className={`mn-pill is-${value}`}>{SENT_LABEL[value] || value}</span>;
}

// Bars per week (or per month across long ranges), drawn to one scale.
function OverTime({ items, days }) {
  const now = Date.now();
  const first = items.length ? Math.min(...items.map(ts).filter(Boolean)) : now;
  const span = days ? days * DAY : Math.max(now - first, 7 * DAY);
  const monthly = span > 26 * 7 * DAY;
  const size = monthly ? 30 * DAY : 7 * DAY;
  const n = Math.max(1, Math.ceil(span / size));
  const start = now - n * size;
  const buckets = Array.from({ length: n }, (_, i) => ({ from: start + i * size, count: 0 }));
  for (const m of items) {
    const i = Math.floor((ts(m) - start) / size);
    if (i >= 0 && i < n) buckets[i].count++;
  }
  const max = Math.max(4, ...buckets.map((b) => b.count));
  const top = Math.ceil(max / 4) * 4;
  const W = 640, H = 210, L = 34, R = 8, T = 10, B = 28;
  const bw = (W - L - R) / n;
  const y = (v) => T + (1 - v / top) * (H - T - B);
  const fmt = (t) => new Date(t).toLocaleDateString("en-US", monthly ? { month: "short" } : { month: "short", day: "numeric" });
  const every = Math.ceil(n / 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dx-chart" role="img" aria-label={`Mentions per ${monthly ? "month" : "week"}`}>
      {[0, top / 2, top].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--card-border-soft)" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="dx-chart-tick">
            {t}
          </text>
        </g>
      ))}
      {buckets.map((b, i) => (
        <g key={b.from}>
          <rect x={L + i * bw + bw * 0.18} y={y(b.count)} width={bw * 0.64} height={Math.max(0, y(0) - y(b.count))} rx="4" fill="var(--accent)" opacity={b.count ? 1 : 0}>
            <title>{`${monthly ? "Month" : "Week"} of ${fmt(b.from)}: ${b.count} mention${b.count === 1 ? "" : "s"}`}</title>
          </rect>
          {i % every === 0 ? (
            <text x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="dx-chart-tick">
              {fmt(b.from)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function Donut({ counts, total }) {
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="mn-donut" role="img" aria-label="Sentiment breakdown">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--state-neutral-bg)" strokeWidth="16" />
      {SENTS.map((s) => {
        const len = total ? (counts[s] / total) * c : 0;
        const el = (
          <circle key={s} cx="70" cy="70" r={r} fill="none" stroke={SENT_COLOR[s]} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
        );
        offset += len;
        return el;
      })}
      <text x="70" y="68" textAnchor="middle" className="mn-donut-n">
        {total}
      </text>
      <text x="70" y="88" textAnchor="middle" className="mn-donut-l">
        {total === 1 ? "mention" : "mentions"}
      </text>
    </svg>
  );
}

function exportCsv(items) {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [["date", "subreddit", "title", "sentiment", "why", "link"].join(",")].concat(
    items.map((m) => [m.post_created_at?.slice(0, 10), m.sub, m.title, m.sentiment, m.sentiment_reason, m.permalink].map(q).join(","))
  );
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `mentions-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export default function MentionsView({ mentions, brandTerms }) {
  const [period, setPeriod] = useState("90");
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sub, setSub] = useState("");

  const days = PERIODS.find((p) => p.key === period)?.days;
  const inPeriod = useMemo(() => (days ? mentions.filter((m) => ts(m) > Date.now() - days * DAY) : mentions), [mentions, days]);
  const prevCount = useMemo(
    () => (days ? mentions.filter((m) => ts(m) <= Date.now() - days * DAY && ts(m) > Date.now() - 2 * days * DAY).length : 0),
    [mentions, days]
  );
  const counts = useMemo(() => Object.fromEntries(SENTS.map((s) => [s, inPeriod.filter((m) => m.sentiment === s).length])), [inPeriod]);
  const total = inPeriod.length;
  // A percentage needs a real base: "+1700%" from one earlier mention says
  // nothing, so small bases show the earlier count instead.
  const change = days && total && prevCount >= 5 ? Math.round(((total - prevCount) / prevCount) * 100) : null;

  const subs = useMemo(() => [...new Set(inPeriod.map((m) => m.sub))].sort(), [inPeriod]);
  const visible = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return inPeriod.filter(
      (m) =>
        (tab === "all" || m.sentiment === tab) &&
        (!sub || m.sub === sub) &&
        (!ql || `${m.title} ${m.snippet || ""} ${m.sub}`.toLowerCase().includes(ql))
    );
  }, [inPeriod, tab, sub, query]);

  const [selectedId, setSelectedId] = useState(null);
  const selected = visible.find((m) => m.id === selectedId) || visible[0] || null;
  const text = (m) => cleanPostText(m.snippet, m.title);

  return (
    <div className="mn">
      <div className="mn-toolbar">
        <label>
          <span className="sr-only">Period</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="op-select">
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="op-btn" onClick={() => exportCsv(visible)} disabled={!visible.length}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="dx-kpis">
        <div className="dx-kpi mn-kpi">
          <span className="dx-kpi-icon tone-blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="dx-kpi-body">
            <span className="dx-kpi-label">Total mentions</span>
            <span className="dx-kpi-value">
              {total}
              {change ? (
                <span className={`dx-delta ${change > 0 ? "is-up" : "is-down"}`} title="Change vs the previous period">
                  {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
                </span>
              ) : null}
            </span>
            <span className="dx-kpi-sub">
              {days ? `In the last ${days} days${!change && prevCount ? ` · ${prevCount} in the ${days} before` : ""}` : "Since tracking began"}
            </span>
          </span>
        </div>
        {SENTS.map((s) => (
          <div key={s} className="dx-kpi mn-kpi">
            <span className={`dx-kpi-icon mn-face is-${s}`} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9.5h.01M15 9.5h.01" />
                {s === "positive" ? <path d="M8.5 14.5a4 4 0 0 0 7 0" /> : s === "negative" ? <path d="M8.5 16a4 4 0 0 1 7 0" /> : <path d="M9 15h6" />}
              </svg>
            </span>
            <span className="dx-kpi-body">
              <span className="dx-kpi-label">{SENT_LABEL[s]}</span>
              <span className="dx-kpi-value">
                {counts[s]}
                <span className={`mn-pill is-${s}`}>{pct(counts[s], total)}%</span>
              </span>
              <span className="dx-kpi-sub">{SENT_LABEL[s]} sentiment</span>
            </span>
          </div>
        ))}
      </div>

      <div className="dx-row dx-row-wide">
        <section className="dx-panel">
          <div className="dx-panel-head">
            <h2>Mentions over time</h2>
            <span className="dx-panel-note">{PERIODS.find((p) => p.key === period)?.label}</span>
          </div>
          <OverTime items={inPeriod} days={days} />
        </section>
        <section className="dx-panel">
          <div className="dx-panel-head">
            <h2>Sentiment breakdown</h2>
          </div>
          <div className="mn-breakdown">
            <Donut counts={counts} total={total} />
            <ul>
              {SENTS.map((s) => (
                <li key={s}>
                  <span className="mn-dot" style={{ background: SENT_COLOR[s] }} />
                  <span>{SENT_LABEL[s]}</span>
                  <strong>{counts[s]}</strong>
                  <span className="mn-muted">{pct(counts[s], total)}%</span>
                </li>
              ))}
            </ul>
          </div>
          {total - SENTS.reduce((n, s) => n + counts[s], 0) > 0 ? (
            <p className="dx-note">{total - SENTS.reduce((n, s) => n + counts[s], 0)} not scored yet.</p>
          ) : null}
        </section>
      </div>

      <div className="mn-split">
        <section className="dx-panel mn-list-panel">
          <div className="op-tabs" role="tablist">
            {[["all", "All"], ...SENTS.map((s) => [s, SENT_LABEL[s]])].map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={`op-tab${tab === k ? " is-active" : ""}`} onClick={() => setTab(k)}>
                {label} <span className="op-tab-n">{k === "all" ? total : counts[k]}</span>
              </button>
            ))}
          </div>
          <div className="mn-filters">
            <label className="mn-search">
              <span className="sr-only">Search mentions</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mentions or subreddits" />
            </label>
            <label>
              <span className="sr-only">Subreddit</span>
              <select value={sub} onChange={(e) => setSub(e.target.value)} className="op-select">
                <option value="">All subreddits</option>
                {subs.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <p className="op-empty">No mentions match these filters.</p>
          ) : (
            <ul className="mn-list">
              {visible.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`mn-row${selected?.id === m.id ? " is-selected" : ""}`}
                    onClick={() => {
                      setSelectedId(m.id);
                      // One column on narrow screens: bring the details into view.
                      if (window.innerWidth <= 1100) requestAnimationFrame(() => document.getElementById("mn-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
                    }}
                    aria-pressed={selected?.id === m.id}
                  >
                    <span className="mn-row-src">
                      <strong>{m.sub}</strong>
                      <span>{ago(m.post_created_at)}</span>
                    </span>
                    <span className="mn-row-main">
                      <span className="mn-row-title">{m.title}</span>
                      {text(m) ? (
                        <span className="mn-row-text">
                          <Highlight text={text(m)} terms={brandTerms} />
                        </span>
                      ) : null}
                    </span>
                    <span className="mn-row-side">
                      <SentimentPill value={m.sentiment} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selected ? (
          <aside className="op-detail mn-detail" id="mn-detail">
            <div className="op-detail-meta">
              <span>{selected.sub}</span>
              <span>· Posted {ago(selected.post_created_at)}</span>
              <SentimentPill value={selected.sentiment} />
            </div>
            <h2 className="op-detail-title">{selected.title}</h2>
            {selected.ups > 0 || selected.comments > 0 ? (
              <div className="op-post-stats">
                {selected.ups > 0 ? <span>↑ {selected.ups.toLocaleString()} upvotes</span> : null}
                {selected.comments > 0 ? <span>{selected.comments.toLocaleString()} comments</span> : null}
              </div>
            ) : null}
            {text(selected) ? (
              <p className="mn-detail-text">
                <Highlight text={text(selected)} terms={brandTerms} />
              </p>
            ) : null}
            <div className="op-actions">
              <a href={selected.permalink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                View on Reddit ↗
              </a>
              <Link href={`/dashboard/drafts/new?url=${encodeURIComponent(selected.permalink || "")}`} className="op-btn">
                Create task
              </Link>
            </div>
            {selected.sentiment_reason ? (
              <section className="mn-insight">
                <h3>AI insight</h3>
                <p className="mn-insight-q">Why this reads as {SENT_LABEL[selected.sentiment]?.toLowerCase() || "it does"}</p>
                <p>{selected.sentiment_reason}</p>
              </section>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
