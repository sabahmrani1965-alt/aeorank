"use client";

const HEADERS = [
  "Type",
  "Subreddit",
  "Status",
  "Created",
  "Published",
  "URL",
  "Live Score",
  "Live Replies",
  "Live Removed",
  "Content",
];

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function ExportTasksCsvButton({ tasks }) {
  function exportCsv() {
    const rows = tasks.map((t) => [
      t.type || "comment",
      t.subreddit,
      t.permalink ? "Published" : "Pending",
      t.created_at ? new Date(t.created_at).toISOString() : "",
      t.posted_at ? new Date(t.posted_at).toISOString() : "",
      t.permalink || "",
      t.live_score ?? "",
      t.live_reply_count ?? "",
      t.live_removed ? "Yes" : "",
      t.body || "",
    ]);
    const csv = [HEADERS, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeorank-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={exportCsv} className="btn btn-ghost">
      Export CSV
    </button>
  );
}
