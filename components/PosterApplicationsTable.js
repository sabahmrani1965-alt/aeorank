"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function ApplicationRow({ application }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  async function approve() {
    setError("");
    setMessage("");
    setTempPassword("");
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/poster-applications/${application.id}/approve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not approve this application.");
      if (!data.isNewAccount) {
        setMessage("Existing account granted poster access.");
      } else if (data.emailSent) {
        setMessage(`Password emailed to ${application.email}.`);
      } else {
        setMessage("Account created, but the email couldn't be sent — share this password manually:");
        setTempPassword(data.temporaryPassword || "");
      }
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setBusy(false);
    }
  }

  async function dismiss() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/poster-applications/${application.id}/dismiss`, { method: "POST" });
      if (!res.ok) throw new Error("Could not dismiss this application.");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--card-border-soft)" }}>
      <td style={{ padding: "10px 12px" }}>{application.email}</td>
      <td style={{ padding: "10px 12px" }}>
        {application.reddit_username ? (
          <a href={`https://www.reddit.com/user/${application.reddit_username}`} target="_blank" rel="noopener noreferrer">
            u/{application.reddit_username}
          </a>
        ) : (
          "—"
        )}
        {application.reddit_check_status === "unverified" && (
          <span
            title="Neither Reddit's API, a direct fetch, nor Pullpush's archive could confirm this account's status — worth a manual look."
            style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "var(--warn, #ffc857)" }}
          >
            unverified
          </span>
        )}
        {application.reddit_check_status === "active_approx" && (
          <span
            title="Confirmed active via Pullpush's historical archive (age + karma), not Reddit's own API — can't confirm it isn't currently suspended."
            style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}
          >
            approx.
          </span>
        )}
      </td>
      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>{application.referrerEmail || "—"}</td>
      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
        {new Date(application.created_at).toLocaleDateString()}
      </td>
      <td style={{ padding: "10px 12px" }}>
        {message ? (
          <div>
            <p style={{ color: "#7ee3a3", fontSize: 13, margin: 0 }}>{message}</p>
            {tempPassword && (
              <code style={{ background: "var(--bg-3)", padding: "4px 8px", borderRadius: 6, fontSize: 13, display: "inline-block", marginTop: 6 }}>
                {tempPassword}
              </code>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={approve} disabled={busy} className="btn btn-primary btn-sm">
              {busy ? "…" : "Approve"}
            </button>
            <button type="button" onClick={dismiss} disabled={busy} className="btn btn-ghost btn-sm">
              Dismiss
            </button>
          </div>
        )}
        {error && (
          <p role="alert" style={{ color: "#ff8a8a", fontSize: 13, margin: "6px 0 0" }}>
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

export default function PosterApplicationsTable({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
        No pending applications.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Email</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Reddit</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Referred by</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Applied</th>
            <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <ApplicationRow key={a.id} application={a} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
