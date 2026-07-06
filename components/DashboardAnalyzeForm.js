"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { urlToSlug } from "@/lib/site";

// Lets a logged-in user kick off a new report straight from the dashboard,
// without re-entering an email (unlike the homepage's UrlForm) — the report
// page itself persists it to their account automatically once it loads.
export default function DashboardAnalyzeForm() {
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(e) {
    e.preventDefault();
    setError("");

    const slug = urlToSlug(website);
    if (!slug) {
      setError("Please enter a valid website.");
      return;
    }

    setLoading(true);
    let url = website.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    router.push(`/report/${slug}?url=${encodeURIComponent(url)}`);
  }

  return (
    <div className="card" style={{ padding: 24, marginBottom: 32 }}>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>Analyze a website</div>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="yourbrand.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={loading}
          aria-label="Website to analyze"
          required
          style={{ flex: "1 1 240px" }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !website}>
          {loading ? "Loading…" : "Analyze →"}
        </button>
      </form>
      {error && (
        <p role="alert" style={{ color: "#ff8a8a", marginTop: 10, fontSize: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}
