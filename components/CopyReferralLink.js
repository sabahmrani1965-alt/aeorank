"use client";

import { useEffect, useState } from "react";

// Server-rendered with a best-guess origin (env var or the known
// production domain) for a correct first paint, then overridden with the
// real window.location.origin once mounted — matters for local dev/preview
// deploys where the env var may not match the actual host.
export default function CopyReferralLink({ userId, fallbackOrigin }) {
  const [origin, setOrigin] = useState(fallbackOrigin || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = `${origin}/apply-poster?ref=${userId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to.
    }
  }

  return (
    <div className="card" style={{ padding: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <code style={{ flex: "1 1 260px", background: "var(--bg-3)", padding: "10px 14px", borderRadius: 8, fontSize: 13.5, wordBreak: "break-all" }}>
        {link}
      </code>
      <button type="button" onClick={copy} className="btn btn-primary btn-sm">
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
