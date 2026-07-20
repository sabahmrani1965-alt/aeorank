"use client";

import { useState } from "react";

export default function ApplyPosterForm({ referral }) {
  const [email, setEmail] = useState("");
  const [reddit, setReddit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/poster-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reddit, ref: referral || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit your application.");
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p style={{ color: "var(--msg-success)", fontSize: 15, margin: 0 }}>
        Thanks — your application is in. We'll be in touch by email if it's a fit.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420, margin: "0 auto" }}>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>
          Reddit username or profile link
        </label>
        <input
          type="text"
          required
          value={reddit}
          onChange={(e) => setReddit(e.target.value)}
          placeholder="u/yourusername or reddit.com/user/yourusername"
          disabled={loading}
          style={{ width: "100%" }}
        />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
          This is the account you'll post from — it needs to be active, not suspended, at least 6 months old, with at least 50 karma.
        </p>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading || !email || !reddit}>
        {loading ? "Submitting…" : "Apply →"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13.5, margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
