import Link from "next/link";

export default function PricingTiers() {
  return (
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
          <Link href="/contact?plan=trial" className="btn btn-ghost">Get Started</Link>
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
          <Link href="/contact?plan=growth" className="btn btn-primary">Get Started</Link>
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
          <Link href="/contact?plan=boost" className="btn btn-ghost">Get Started</Link>
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
          <Link href="/contact?plan=enterprise" className="btn btn-ghost">Book a Call</Link>
        </div>
      </div>
    </div>
  );
}
