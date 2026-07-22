"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RedditVerifyForm({ initialRef = "" }) {
  const router = useRouter();
  const [reddit, setReddit] = useState("");
  const [ref, setRef] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/poster/verify-reddit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reddit, ref }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not verify your Reddit account.");
      router.push("/poster");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label className="auth-field" style={{ marginBottom: 0 }}>
        <span>Reddit username or profile link</span>
        <input
          type="text"
          required
          value={reddit}
          onChange={(e) => setReddit(e.target.value)}
          placeholder="u/yourusername or reddit.com/user/yourusername"
          disabled={loading}
        />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
          This is the account you'll post from — it needs to be active, not suspended, at least 1
          month old, with at least 5 karma.
        </p>
      </label>

      <label className="auth-field" style={{ marginBottom: 0 }}>
        <span>Referral code (optional)</span>
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="Only if a creator referred you"
          disabled={loading}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={loading || !reddit}>
        {loading ? "Verifying…" : "Verify & continue →"}
      </button>

      {error && (
        <p role="alert" style={{ color: "var(--msg-danger)", fontSize: 13.5, margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
