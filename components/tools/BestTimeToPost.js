"use client";

import { useMemo } from "react";
import { ToolForm, ToolStatus, fmt, plural, useRedditTool } from "./useRedditTool";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCKS = [0, 3, 6, 9, 12, 15, 18, 21]; // 3-hour blocks keep a month of top posts readable
const hourLabel = (h) => `${((h + 11) % 12) + 1}${h < 12 ? "am" : "pm"}`;

// Top posts of the month, bucketed by weekday and 3-hour block in the
// visitor's own time zone (the browser's local time).
function analyse(posts) {
  const grid = DAYS.map(() => BLOCKS.map(() => ({ n: 0, score: 0 })));
  const byDay = DAYS.map(() => 0);
  const byHour = Array.from({ length: 24 }, () => 0);
  for (const p of posts) {
    const d = new Date(p.t);
    const day = (d.getDay() + 6) % 7;
    const cell = grid[day][Math.floor(d.getHours() / 3)];
    cell.n++;
    cell.score += p.score;
    byDay[day]++;
    byHour[d.getHours()]++;
  }
  const max = Math.max(1, ...grid.flat().map((c) => c.n));
  const best = grid
    .flatMap((row, d) => row.map((c, b) => ({ d, b, ...c })))
    .filter((c) => c.n)
    .sort((a, b) => b.n - a.n || b.score - a.score)
    .slice(0, 3);
  const bestDay = byDay.indexOf(Math.max(...byDay));
  const bestHour = byHour.indexOf(Math.max(...byHour));
  return { grid, max, best, bestDay, bestHour };
}

export default function BestTimeToPost() {
  const { status, data, error, run } = useRedditTool("best-time-to-post");
  const a = useMemo(() => (data ? analyse(data.posts) : null), [data]);
  const zone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "your time zone";

  return (
    <div className="card">
      <ToolForm id="bt-in" label="Subreddit" placeholder="e.g. r/SaaS" button="Find the best time" onSubmit={run} loading={status === "loading"} />
      <ToolStatus status={status} error={error} loadingText="Reading this month's top posts… (about 15 seconds)" />
      {status === "done" && a && (
        <>
          <p className="rt-summary">
            Based on the {data.posts.length} top posts of the past month in <strong>r/{data.sub}</strong>, shown in your time
            zone ({zone}).
          </p>
          <div className="rt-stats">
            <div>
              <span className="rt-stat-label">Best day</span>
              <strong>{DAYS[a.bestDay]}</strong>
            </div>
            <div>
              <span className="rt-stat-label">Best hour</span>
              <strong>{hourLabel(a.bestHour)}</strong>
            </div>
            <div>
              <span className="rt-stat-label">Best windows</span>
              <strong>
                {a.best.map((c) => `${DAYS[c.d]} ${hourLabel(BLOCKS[c.b])}–${hourLabel((BLOCKS[c.b] + 3) % 24)}`).join(" · ")}
              </strong>
            </div>
          </div>

          <div className="rt-heat-wrap">
            <table className="rt-heat">
              <caption className="sr-only">Number of top posts by weekday and time of day</caption>
              <thead>
                <tr>
                  <th />
                  {BLOCKS.map((h) => (
                    <th key={h} scope="col">
                      {hourLabel(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {a.grid.map((row, d) => (
                  <tr key={DAYS[d]}>
                    <th scope="row">{DAYS[d]}</th>
                    {row.map((c, b) => (
                      <td
                        key={b}
                        style={{ "--heat": c.n / a.max }}
                        title={`${DAYS[d]} ${hourLabel(BLOCKS[b])}: ${c.n} top posts, ${fmt(c.score)} upvotes`}
                      >
                        {c.n || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tool-meta">Each cell counts the month's top posts published in that 3-hour window. Darker means more.</p>

          {data.top?.length ? (
            <>
              <h3 className="rt-h3">Top posts this month</h3>
              <ul className="rt-mini">
                {data.top.map((p) => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.title}
                    </a>
                    <span>
                      {plural(p.score, "upvote")} · {plural(p.comments, "comment")}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
