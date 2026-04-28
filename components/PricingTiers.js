"use client";

import { useState } from "react";

// All four tiers (Starter pack, 1-month trial, Growth, Boost) route through
// Stripe Checkout via /api/checkout. The Starter pack is the low-friction
// entry point; subscriptions are differentiated by AEO strategy guidance
// and reporting on top of the raw post/comment volume.
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
          <div className="pricing-name">Pay as you go</div>
          <div className="pricing-price">$250</div>
          <div className="pricing-divider" />
          <p className="pricing-desc">
            Test the waters with credits. No monthly commitment, use them when you want.
          </p>
          <ul className="pricing-features">
            <li>$30 per Reddit post</li>
            <li>$15 per comment</li>
            <li>Every output approved by you before going live</li>
            <li>Use over 30 days, top up any time</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="starter" className="btn btn-ghost">
              Buy Starter Pack
            </CheckoutButton>
          </div>
        </div>

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
            <li>10 strategic posts + 60 comments per month</li>
            <li>AEO strategy: what to post, what to skip, when to push back</li>
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
            <li>20 strategic posts + 100 comments per month</li>
            <li>Hands-on AEO playbook: I tell you what to post and what not to</li>
            <li>Live AI Visibility tracking, weekly reports</li>
            <li>Monthly strategy call</li>
          </ul>
          <div className="pricing-actions">
            <CheckoutButton plan="boost" className="btn btn-ghost">
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
