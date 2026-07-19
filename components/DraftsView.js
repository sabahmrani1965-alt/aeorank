"use client";

import { useState } from "react";
import PostDraftActions from "./PostDraftActions";
import TrackTasksTable from "./TrackTasksTable";

export default function DraftsView({ drafts, initialView = "cards" }) {
  const [view, setView] = useState(initialView);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setView("cards")}
          className={view === "cards" ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
        >
          Cards
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={view === "table" ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
        >
          Table
        </button>
      </div>

      {view === "cards" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {drafts.map((d) => (
            <div key={d.id} className="card">
              <div className="reddit-mock">
                <div className="reddit-mock-meta">
                  {d.subreddit} · {d.posted ? "Posted" : "Draft — not posted yet"}
                </div>
                <div className="reddit-mock-title">{d.title}</div>
                <div className="reddit-mock-body">{d.body}</div>
                <PostDraftActions
                  title={d.title}
                  body={d.body}
                  draftId={d.id}
                  initialPosted={d.posted}
                  initialPermalink={d.permalink}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TrackTasksTable tasks={drafts} />
      )}
    </div>
  );
}
