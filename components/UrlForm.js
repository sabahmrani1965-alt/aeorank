"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function urlToSlug(input) {
  let url = input.trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const base = host.split(".")[0];
    return base.toLowerCase().replace(/[^a-z0-9]/g, "");
  } catch {
    return input.toLowerCase().replace(/[^a-z0-9]/g, "");
  }
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function UrlForm() {
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");

    const slug = urlToSlug(website);
    if (!slug) {
      setError("Please enter a valid website.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    let url = website.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    try {
      // Capture the lead and trigger the report email in the background.
      // We don't await long: the API saves the lead and queues the email,
      // returning quickly so the user can see their report.
      fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, url, brandSlug: slug }),
      }).catch(() => {}); // fire-and-forget; the report page works regardless

      // Send the user straight to their report
      router.push(`/report/${slug}?url=${encodeURIComponent(url)}`);
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="url-form-stack">
      <div className="url-form-row">
        <input
          type="text"
          placeholder="yourbrand.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={loading}
          aria-label="Your website"
          required
        />
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          aria-label="Your email"
          required
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !website || !email}
        >
          {loading ? <span className="loader" /> : "Get free report →"}
        </button>
      </div>
      {error && <div className="url-form-error">{error}</div>}
      <div className="url-form-meta">
        We'll email you a summary so you can share it with your team.
      </div>
    </form>
  );
}
