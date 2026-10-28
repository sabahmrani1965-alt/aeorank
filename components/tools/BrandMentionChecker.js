"use client";

import Link from "next/link";
import { ToolForm, ToolStatus, ago, plural, useRedditTool } from "./useRedditTool";

// "in the last 5 hours" / "in the last 3 days" for the period a capped result covers.
function span(ms) {
  const h = Math.max(1, Math.ceil((Date.now() - ms) / 3600000));
  return h < 48 ? `in the last ${h} ${h === 1 ? "hour" : "hours"}` : `in the last ${Math.ceil(h / 24)} days`;
}

export default function BrandMentionChecker() {
  const { status, data, error, query, run } = useRedditTool("brand-mentions");
  const brand = query || data?.brand;
  return (
    <div className="card">
      <ToolForm id="bm-in" label="Brand or product name" placeholder="e.g. Notion" button="Check mentions" onSubmit={run} loading={status === "loading"} />
      <ToolStatus status={status} error={error} loadingText="Searching the past month of Reddit posts… (about 15 seconds)" />
      {status === "done" && (
        <>
          <p className="rt-summary">
            {data.total === 0 ? (
              <>
                No Reddit posts named <strong>{brand}</strong> in the past month. That also means no thread is shaping what AI
                assistants read about you yet.
              </>
            ) : data.capped ? (
              <>
                <strong>{brand}</strong> is talked about a lot: at least <strong>{plural(data.total, "post")}</strong> named it{" "}
                {span(data.since)}. These are the newest.
              </>
            ) : (
              <>
                <strong>{plural(data.total, "Reddit post")}</strong> named <strong>{brand}</strong> in the past month
                {data.total > data.mentions.length ? `; the ${data.mentions.length} newest are below` : ""}.
              </>
            )}
          </p>
          {data.subreddits.length > 0 && (
            <div className="rt-chips">
              {data.subreddits.map(([sub, n]) => (
                <span key={sub} className="rt-chip">
                  r/{sub} · {n}
                </span>
              ))}
            </div>
          )}
          {data.mentions.length > 0 && (
            <ul className="rt-mini">
              {data.mentions.map((m) => (
                <li key={m.url}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer">
                    {m.title}
                  </a>
                  <span>
                    r/{m.sub} · {ago(m.created)} · {plural(m.score, "upvote")} · {plural(m.comments, "comment")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="rt-cta">
            <p>Comments mention brands too, and new threads appear every day. AEOrank tracks every mention, with sentiment, and tells you when one needs an answer.</p>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Track mentions daily →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
