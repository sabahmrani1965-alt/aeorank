"use client";

import { useState } from "react";

// Three subscription tiers (Lite, Pro, Max) route through Stripe Checkout
// via /api/checkout. Checkout still submits the underlying plan keys
// (starter/growth/scale) that lib/stripe.js, lib/credits.js, and the admin
// dashboard already key off of — only the public-facing name/price/feature
// copy changed here, not the internal plan identifiers.
const ALSO_INCLUDED = [
  "Access To High Karma Accounts",
  "1-Click Commenting & Posting",
  "Smart Upvoting",
  "Analytics & Reporting",
];

const TIERS = [
  {
    plan: "starter",
    name: "Lite",
    tagline: "Access to core features.",
    price: "$199",
    cta: "Get Lite",
    ctaClass: "btn btn-ghost",
    features: [
      { text: "$100 Monthly Credits Included", type: "metered" },
      { text: "$10 Per Comment | $20 Per Post", type: "metered" },
      { text: "$0.1 Per Upvote", type: "metered" },
      { text: "New Thread Scans (Every 2 Weeks)", type: "feature" },
      { text: "Brand & Competitor Mentions (Weekly)", type: "feature" },
      { text: "Monitor 50 Keywords", type: "feature" },
      { text: "Connect Up to 3 Brands", type: "feature" },
      { text: "Add Up to 2 Team Members", type: "feature" },
    ],
  },
  {
    plan: "growth",
    name: "Pro",
    tagline: "Get more out of Reddit.",
    price: "$299",
    cta: "Get Pro",
    ctaClass: "btn btn-ghost",
    features: [
      { text: "$200 Monthly Credits Included", type: "metered" },
      { text: "$7 Per Comment | $15 Per Post", type: "metered" },
      { text: "$0.1 Per Upvote", type: "metered" },
      { text: "New Thread Scans (Weekly)", type: "feature" },
      { text: "Brand & Competitor Mentions (Daily)", type: "feature" },
      { text: "Monitor 75 Keywords", type: "feature" },
      { text: "Connect Up to 6 Brands", type: "feature" },
      { text: "Add Unlimited Team Members", type: "feature" },
      { text: "Dedicated Slack Channel", type: "metered" },
    ],
  },
  {
    plan: "scale",
    name: "Max",
    tagline: "Our most advanced features.",
    price: "$449",
    cta: "Start 7-Day Free Trial",
    ctaClass: "btn btn-primary",
    badge: "Best Value",
    trialNote: "7 days free, then $449/mo. Card required, cancel anytime before the trial ends.",
    features: [
      { text: "$300 Monthly Credits Included", type: "metered" },
      { text: "$5 Per Comment | $10 Per Post", type: "metered" },
      { text: "$0.1 Per Upvote", type: "metered" },
      { text: "New Thread Scans (Daily)", type: "feature" },
      { text: "Brand & Competitor Mentions (Daily)", type: "feature" },
      { text: "Monitor 100 Keywords", type: "feature" },
      { text: "Connect Up to 10 Brands", type: "feature" },
      { text: "Add Unlimited Team Members", type: "feature" },
      { text: "Dedicated Slack Channel", type: "metered" },
    ],
  },
];

function FeatureRow({ text, type }) {
  return (
    <li className={`pricing-row pricing-row-${type}`}>
      <span className="pricing-row-check">✓</span>
      <span className="pricing-row-text">{text}</span>
      <span className="pricing-row-info" title={text}>
        ⓘ
      </span>
    </li>
  );
}

export default function PricingTiers({ brand = "" }) {
  const [loading, setLoading] = useState(""); // which plan key is in-flight
  const [error, setError] = useState("");

  async function startCheckout(plan) {
    if (loading) return;
    setError("");
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, brand }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Could not start checkout.");
      }
      window.location.assign(data.url);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
      setLoading("");
    }
  }

  return (
    <>
      <div className="pricing-grid">
        {TIERS.map((tier) => (
          <div key={tier.plan} className={`pricing-card${tier.badge ? " best-value" : ""}`}>
            {tier.badge ? <div className="pricing-corner-badge">{tier.badge}</div> : null}
            <div className="pricing-name">{tier.name}</div>
            <p className="pricing-tagline">{tier.tagline}</p>
            <div className="pricing-divider" />
            <div className="pricing-price">
              {tier.price} <span className="per">/ MONTH</span>
            </div>
            <div className="pricing-actions">
              <button
                type="button"
                className={tier.ctaClass}
                onClick={() => startCheckout(tier.plan)}
                disabled={Boolean(loading)}
                style={loading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
              >
                {loading === tier.plan ? "Redirecting…" : `${tier.cta} →`}
              </button>
            </div>
            {tier.trialNote && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
                {tier.trialNote}
              </p>
            )}

            <ul className="pricing-features">
              {tier.features.map((f) => (
                <FeatureRow key={f.text} text={f.text} type={f.type} />
              ))}
            </ul>

            <div className="pricing-also-included">Also Included</div>
            <ul className="pricing-features">
              {ALSO_INCLUDED.map((text) => (
                <FeatureRow key={text} text={text} type="feature" />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="pricing-topup">
        Need more credits? Top up anytime inside your dashboard. Pay only for what you use.
      </p>

      {error ? (
        <p
          role="alert"
          style={{
            color: "var(--state-danger-fg)",
            textAlign: "center",
            marginTop: 16,
            fontSize: 14,
          }}
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
