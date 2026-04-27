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

export default function UrlForm() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function submit(e) {
    e.preventDefault();
    const slug = urlToSlug(value);
    if (!slug) return;
    setLoading(true);
    let url = value.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    router.push(`/report/${slug}?url=${encodeURIComponent(url)}`);
  }

  return (
    <form onSubmit={submit} className="url-form">
      <input
        type="text"
        placeholder="Enter your website (e.g. yourbrand.com)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
      />
      <button type="submit" className="btn btn-primary" disabled={loading || !value}>
        {loading ? <span className="loader" /> : "Get free report →"}
      </button>
    </form>
  );
}
