"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeRedditUrl } from "@/lib/format";

export default function NewCampaignPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!normalizeRedditUrl(targetUrl)) {
      setError("That doesn't look like a Reddit link. Paste the full URL of the post.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not create campaign.");
      router.push(`/dashboard/campaigns/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <span className="section-tag">( new campaign )</span>
        <h2>Track a Reddit post</h2>
        <p className="section-sub">
          Paste the link to an existing Reddit post. From there you can
          check its real, live upvote/reply/removal status any time, and
          see a chart of how it changes over time.
        </p>

        <form onSubmit={save} className="card" style={{ padding: 24 }}>
          <label className="auth-field">
            <span>
              Reddit post URL <span style={{ color: "var(--accent)" }}>*</span>
            </span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.reddit.com/r/SaaS/comments/…"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span>Label (optional)</span>
            <input
              type="text"
              placeholder="A name to recognize this campaign by"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          {error && (
            <p role="alert" style={{ color: "#ff8a8a", marginBottom: 12, fontSize: 14 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => router.push("/dashboard/campaigns")}>
              ← Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Creating…" : "Create Campaign →"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
