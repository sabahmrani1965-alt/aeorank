"use client";

import { ToolForm, ToolStatus, fmt, useRedditTool } from "./useRedditTool";

export default function SubredditFinder() {
  const { status, data, error, run } = useRedditTool("subreddit-finder");
  return (
    <div className="card">
      <ToolForm id="sf-in" label="Topic, product category or audience" placeholder="e.g. project management" button="Find subreddits" onSubmit={run} loading={status === "loading"} />
      <ToolStatus status={status} error={error} loadingText="Searching a year of Reddit posts on this topic… (about 20 seconds)" />
      {status === "done" &&
        (data.subreddits.length === 0 ? (
          <p className="rt-status">No subreddits found for &ldquo;{data.query}&rdquo;. Try a broader topic.</p>
        ) : (
          <>
            <p className="rt-summary">
              Subreddits where &ldquo;{data.query}&rdquo; came up most in the past year, most active first.
            </p>
            <ol className="rt-list">
              {data.subreddits.map((s) => (
                <li key={s.name} className="rt-item">
                  <div className="rt-item-head">
                    <a href={`https://www.reddit.com/r/${s.name}/`} target="_blank" rel="noopener noreferrer" className="rt-item-title">
                      r/{s.name}
                    </a>
                    <span className="rt-chip">{s.posts} matching {s.posts === 1 ? "post" : "posts"}</span>
                  </div>
                  {s.description ? <p className="rt-item-desc">{s.description}</p> : null}
                  <div className="rt-item-meta">
                    {s.weeklyVisitors ? <span>{fmt(s.weeklyVisitors)} weekly visitors</span> : null}
                    {s.weeklyContributions ? <span>{fmt(s.weeklyContributions)} posts and comments a week</span> : null}
                    <span>{fmt(s.comments)} comments on matching posts</span>
                  </div>
                  {s.examples?.[0] ? (
                    <a href={s.examples[0].url} target="_blank" rel="noopener noreferrer" className="rt-item-example">
                      e.g. &ldquo;{s.examples[0].title}&rdquo;
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </>
        ))}
    </div>
  );
}
