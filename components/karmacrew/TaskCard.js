"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_LABEL = { comment: "Comment", reply: "Reply", post: "Post", upvote: "Upvote" };

export default function TaskCard({ task, onCoolingDown, disabledReason }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  const disabled = claiming || Boolean(disabledReason);

  async function startTask() {
    setError("");
    setClaiming(true);
    try {
      const res = await fetch(`/api/poster/tasks/${task.id}/claim`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not claim this task.");
      router.push(`/poster/task/${task.id}`);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setClaiming(false);
    }
  }

  return (
    <div className="kc-task-card fade-in">
      <div className="kc-task-card-head">
        <span className="kc-task-subreddit">r/{task.subreddit}</span>
        <span className="kc-task-reward">${task.reward.toFixed(2)}</span>
      </div>

      <div className="kc-task-meta">
        <span className="kc-badge kc-badge-neutral">{TYPE_LABEL[task.type] || "Comment"}</span>
        <span className="kc-badge kc-badge-neutral">{task.difficulty}</span>
        <span>⏱ {task.estimatedMinutes} min</span>
        <span>🎟 {task.slotsRemaining}/{task.slotsTotal} slots</span>
      </div>

      <p className="kc-task-desc">{task.title}</p>

      <button type="button" onClick={startTask} disabled={disabled} className="btn btn-primary btn-large" style={{ width: "100%" }}>
        {claiming ? "Claiming…" : disabledReason || "Start Task →"}
      </button>

      {error && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 12.5, margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
