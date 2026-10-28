"use client";

import { useEffect, useState } from "react";

// One scan per page load, even if the effect runs twice (React dev mode,
// remounts): a second request would start a second paid scan whose result
// could differ from the one on screen.
let scan = null;
const runScan = () =>
  (scan ||= fetch("/api/onboarding/preview", { method: "POST" }).then((r) => (r.ok ? r.json() : null)));

// The brand's own first results, shown above the plans on the last
// onboarding step: how often the AI engines name it for its category, who
// they name instead, and the best Reddit threads found for it. Real data
// from app/api/onboarding/preview, never examples; if the scan fails the
// block just disappears and the plans remain.
export default function OnboardingPreview({ brand }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    runScan()
      .then((j) => {
        if (cancelled) return;
        if (j?.ok && (j.ai || j.opportunities?.total)) {
          setData(j);
          setState("done");
        } else setState("empty");
      })
      .catch(() => !cancelled && setState("empty"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "empty") return null;
  if (state === "loading") {
    return (
      <div className="ob-preview ob-preview-loading" role="status">
        <span className="ob-spinner" aria-hidden="true" />
        <div>
          <strong>Scanning for {brand || "your brand"}…</strong>
          <p>We're searching Reddit for your buyers' questions and asking the AI engines about your category. This takes up to a minute.</p>
        </div>
      </div>
    );
  }

  const { ai, opportunities } = data;
  const engines = ai ? Object.entries(ai.byEngine || {}) : [];
  const others = (ai?.competitors || []).filter((c) => c && c.toLowerCase() !== String(brand).toLowerCase()).slice(0, 5);

  return (
    <div className="ob-preview">
      <span className="section-tag">( your results )</span>
      <h3>What we found for {data.brand || brand}</h3>

      <div className="ob-preview-grid">
        {ai && (
          <div className="ob-preview-card">
            <div className="ob-preview-label">AI visibility</div>
            <div className="ob-preview-big">{ai.score}%</div>
            <p className="ob-preview-note">
              Named in {ai.hits} of {ai.total} AI answers for &ldquo;{ai.category}&rdquo;.
            </p>
            {engines.length > 0 && (
              <ul className="ob-engines">
                {engines.map(([name, e]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <span>
                      {e.mentions}/{e.answers}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {others.length > 0 && (
              <p className="ob-preview-note">
                Named instead: <strong>{others.join(", ")}</strong>
              </p>
            )}
          </div>
        )}

        {opportunities?.total > 0 && (
          <div className="ob-preview-card">
            <div className="ob-preview-label">Reddit opportunities</div>
            <div className="ob-preview-big">{opportunities.total}</div>
            <p className="ob-preview-note">Threads where your buyers are asking. The best ones:</p>
            <ul className="ob-threads">
              {opportunities.top.map((o) => (
                <li key={o.id}>
                  <span className="ob-thread-title">{o.title}</span>
                  <span className="ob-thread-meta">
                    {o.sub}
                    {o.relevance_score != null ? ` · fit ${o.relevance_score}/100` : ""}
                    {o.comments ? ` · ${o.comments} comments` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="ob-preview-cta">
        Start a 7-day free trial to see every thread, get comments drafted for you, and track your AI visibility every day.
      </p>
    </div>
  );
}
