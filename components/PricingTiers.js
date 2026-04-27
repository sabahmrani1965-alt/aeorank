"use client";

import Link from "next/link";
import { useState } from "react";

// Trial / Growth / Boost route through Stripe Checkout via /api/checkout.
// Enterprise stays a contact link — those deals are scoped on a call.
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
          <div className="pricing-name">1-month trial</div>
          <div className="pricing-price">$1,000</div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            A one-month proof run built to show traction fast, not theory.
          </p>
          <ul className="pricing-features">
            <li>40 Reddit comments with brand mentions</li>
            <li>Placement in threads already getting search traffic</li>
            <li>Built to validate Reddit as a channel</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="trial" className="btn btn-ghost">
              Get Started
            </CheckoutButton>
          </div>
        </div>

        <div className="pricing-card popular">
          <div className="pricing-name">Growth</div>
          <div className="pricing-price">
            $2,000 <span className="per">/ month</span>
          </div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Consistent visibility with full control and clear measurement.
          </p>
          <ul className="pricing-features">
            <li>10 strategic posts in relevant subreddits</li>
            <li>60 comments reviewed and approved by you</li>
            <li>Live AI Visibility tracking (ChatGPT, Claude, Gemini)</li>
            <li>Weekly activity and performance reports</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="growth" className="btn btn-primary">
              Get Started
            </CheckoutButton>
          </div>
        </div>

        <div className="pricing-card">
          <div className="pricing-name">Full Boost</div>
          <div className="pricing-price">
            $3,500 <span className="per">/ month</span>
          </div>
          <div className="pricing-badge">🚀 Highest Growth</div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Aggressive expansion for brands ready to scale attention and trust.
          </p>
          <ul className="pricing-features">
            <li>20 strategic posts in relevant subreddits</li>
            <li>100 comments reviewed and approved by you</li>
            <li>Live AI Visibility tracking</li>
            <li>Monthly strategy call</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="boost" className="btn btn-ghost">
              Get Started
            </CheckoutButton>
          </div>
        </div>

        <div className="pricing-card">
          <div className="pricing-name">Enterprise</div>
          <div className="pricing-price" style={{ fontSize: 24 }}>Custom</div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Built for companies that want control, presence, and long-term leverage.
          </p>
          <ul className="pricing-features">
            <li>30+ strategic posts in relevant subreddits</li>
            <li>150+ comments reviewed and approved</li>
            <li>Branded subreddit creation and management</li>
            <li>Designed for serious growth 🚀</li>
          </ul>
          <div className="pricing-actions">
            <Link href="/contact?plan=enterprise" className="btn btn-ghost">
              Book a Call
            </Link>
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
