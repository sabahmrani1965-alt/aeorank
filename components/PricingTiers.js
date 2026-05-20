"use client";

import { useState } from "react";

// Three monthly partnership tiers (Starter, Growth, Scale) route through
// Stripe Checkout via /api/checkout. Differentiation is on volume (posts,
// comments, blog placements) and surface (LinkedIn, case study). AEO
// structuring across ChatGPT / Perplexity / Claude is included in every tier.
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

  function CheckoutButton({ plan, className, children }) {
    const isLoading = loading === plan;
    const disabled = Boolean(loading);
    return (
      <button
        type="button"
        className={className}
        onClick={() => startCheckout(plan)}
        disabled={disabled}
        style={disabled ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
      >
        {isLoading ? "Redirecting…" : children}
      </button>
    );
  }

  return (
    <>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-name">Starter</div>
          <div className="pricing-price">
            $2,000 <span className="per">/ month</span>
          </div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Consistent monthly presence across Reddit and AI answers — built to start moving the needle.
          </p>
          <ul className="pricing-features">
            <li>5 Reddit posts from established accounts</li>
            <li>15 strategic comments with natural brand mentions</li>
            <li>1 blog post published on saasoffers.tech (our sister marketplace)</li>
            <li>AEO structuring across ChatGPT, Perplexity & Claude</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="starter" className="btn btn-ghost">
              Get Started
            </CheckoutButton>
          </div>
        </div>

        <div className="pricing-card popular">
          <div className="pricing-name">Growth</div>
          <div className="pricing-price">
            $3,500 <span className="per">/ month</span>
          </div>
          <div className="pricing-badge">Recommended</div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Compounding presence with newsletter reach — the sweet spot for most B2B SaaS brands.
          </p>
          <ul className="pricing-features">
            <li>9 Reddit posts from established accounts</li>
            <li>25 strategic comments with natural brand mentions</li>
            <li>2 blog posts published on saasoffers.tech (our sister marketplace)</li>
            <li>Newsletter mention — direct email to the SaaSOffers founder audience</li>
            <li>AEO structuring across ChatGPT, Perplexity & Claude</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="growth" className="btn btn-primary">
              Get Started
            </CheckoutButton>
          </div>
        </div>

        <div className="pricing-card">
          <div className="pricing-name">Scale</div>
          <div className="pricing-price">
            $6,500 <span className="per">/ month</span>
          </div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Aggressive expansion with permanent placement — built for brands ready to dominate their category in AI answers.
          </p>
          <ul className="pricing-features">
            <li>18 Reddit posts from established accounts</li>
            <li>50 strategic comments with natural brand mentions</li>
            <li>4 blog posts published on saasoffers.tech (our sister marketplace)</li>
            <li>Newsletter mention — direct email to the SaaSOffers founder audience</li>
            <li>Permanent featured listing on saasoffers.tech</li>
            <li>AEO structuring across ChatGPT, Perplexity & Claude</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="scale" className="btn btn-ghost">
              Get Started
            </CheckoutButton>
          </div>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            color: "#ff8a8a",
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
