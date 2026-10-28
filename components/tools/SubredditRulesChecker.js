"use client";

import { ToolForm, ToolStatus, fmt, useRedditTool } from "./useRedditTool";

const FLAG_LABEL = {
  promo: "Self-promotion",
  links: "Links",
  account: "Karma / account age",
  ai: "AI content",
  flair: "Flair",
  title: "Titles",
  thread: "Megathread",
};

export default function SubredditRulesChecker() {
  const { status, data, error, run } = useRedditTool("subreddit-rules");
  return (
    <div className="card">
      <ToolForm id="sr-in" label="Subreddit" placeholder="e.g. r/startups" button="Check the rules" onSubmit={run} loading={status === "loading"} />
      <ToolStatus status={status} error={error} loadingText="Reading the subreddit's rules…" />
      {status === "done" && (
        <>
          <div className="rt-stats">
            <div>
              <span className="rt-stat-label">Subreddit</span>
              <strong>
                <a href={`https://www.reddit.com/r/${data.sub}/`} target="_blank" rel="noopener noreferrer">
                  r/{data.sub}
                </a>
              </strong>
            </div>
            <div>
              <span className="rt-stat-label">Weekly visitors</span>
              <strong>{fmt(data.weeklyVisitors)}</strong>
            </div>
            <div>
              <span className="rt-stat-label">Posts and comments a week</span>
              <strong>{fmt(data.weeklyContributions)}</strong>
            </div>
          </div>

          {data.rules.length === 0 ? (
            <p className="rt-status">r/{data.sub} lists no rules of its own. Reddit&apos;s site-wide rules still apply.</p>
          ) : (
            <>
              <p className="rt-summary">
                {data.rules.length} rules. {data.flags.length ? "What they cover, at a glance:" : "None of them restrict promotion, links or accounts."}
              </p>
              {data.flags.length > 0 && (
                <div className="rt-chips">
                  {data.flags.map((f) => (
                    <span key={f.key} className={`rt-chip${f.key === "promo" || f.key === "account" ? " rt-chip-warn" : ""}`}>
                      {f.label}
                    </span>
                  ))}
                </div>
              )}
              <ol className="rt-rules">
                {data.rules.map((r, i) => (
                  <li key={i}>
                    <p>{r.body}</p>
                    {r.flags.length > 0 && (
                      <div className="rt-rule-tags">
                        {r.flags.map((f) => (
                          <span key={f}>{FLAG_LABEL[f]}</span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </div>
  );
}
