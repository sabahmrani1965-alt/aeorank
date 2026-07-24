"use client";

import { useEffect, useState } from "react";

// Server-rendered with a best-guess origin (env var or the known
// production domain) for a correct first paint, then overridden with the
// real window.location.origin once mounted — matters for local dev/preview
// deploys where the env var may not match the actual host.
export default function CopyReferralLink({ userId, referralCode, fallbackOrigin }) {
  const [origin, setOrigin] = useState(fallbackOrigin || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Falls back to the raw user id if a code couldn't be generated (e.g.
  // service role not configured) — the link still works either way, since
  // resolveReferrerId() in lib/posterPay.js accepts a legacy id too.
  const refValue = referralCode || userId;
  const link = `${origin}/apply-poster?ref=${refValue}`;

  async function copyText(text, setCopied) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to.
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="card" style={{ padding: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <code style={{ flex: "1 1 220px", background: "var(--bg-3)", padding: "7px 11px", borderRadius: 8, fontSize: 12, wordBreak: "break-all" }}>
          {link}
        </code>
        <button type="button" onClick={() => copyText(link, setCopiedLink)} className="btn btn-primary btn-sm">
          {copiedLink ? "Copied" : "Copy link"}
        </button>
      </div>

      {referralCode && (
        <div className="card" style={{ padding: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 2 }}>
              Or just share this code, easier to say or type than the full link
            </div>
            <code style={{ background: "var(--bg-3)", padding: "6px 12px", borderRadius: 8, fontSize: 16, fontWeight: 700, letterSpacing: "0.08em" }}>
              {referralCode}
            </code>
          </div>
          <button type="button" onClick={() => copyText(referralCode, setCopiedCode)} className="btn btn-secondary btn-sm">
            {copiedCode ? "Copied" : "Copy code"}
          </button>
        </div>
      )}
    </div>
  );
}
