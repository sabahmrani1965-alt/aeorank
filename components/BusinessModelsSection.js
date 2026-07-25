"use client";

import { useState } from "react";

// Illustrative example threads per business model — fixed sample data (member
// counts, click estimates, vote counts), same "illustrative, not live"
// convention as HeroVisual.js. No fabricated brand mentions/testimonials
// here (unlike ResultsSection.js's mocks) — these are just example question
// threads, so there's nothing here a visitor could fact-check and find untrue.
const CATEGORIES = [
  {
    key: "ecommerce",
    label: "E-Commerce",
    icon: "🛒",
    posts: [
      { sub: "r/jewelry", time: "2y ago", members: "892k Members", online: "4.1k", clicks: "6,000+", before: "Where to buy ", highlight: "mens jewelry", after: "?", ups: 85, comments: 21 },
      { sub: "r/supplements", time: "5mo ago", members: "2.4m Members", online: "12.5k", clicks: "19,500+", before: "", highlight: "Best supplement brands", after: " that are actually third-party tested?", ups: 73, comments: 15 },
      { sub: "r/skincareaddiction", time: "1y ago", members: "5.0m Members", online: "15.2k", clicks: "14,200+", before: "What are the best ", highlight: "anti-aging products", after: " that actually work?", ups: 53, comments: 17 },
    ],
  },
  {
    key: "saas",
    label: "SaaS/Software",
    icon: "☁️",
    posts: [
      { sub: "r/webdev", time: "1y ago", members: "1.2m Members", online: "8.3k", clicks: "12,000+", before: "What ", highlight: "project management tool", after: " does your team use?", ups: 90, comments: 19 },
      { sub: "r/entrepreneur", time: "8mo ago", members: "980k Members", online: "5.2k", clicks: "15,300+", before: "Looking for a good ", highlight: "CRM for small business", after: "", ups: 75, comments: 24 },
      { sub: "r/startups", time: "9mo ago", members: "2.1m Members", online: "8.5k", clicks: "16,500+", before: "What ", highlight: "analytics tools", after: " do you use?", ups: 73, comments: 12 },
    ],
  },
  {
    key: "info",
    label: "Info/Education",
    icon: "🎓",
    posts: [
      { sub: "r/programming", time: "8mo ago", members: "6.9m Members", online: "24.5k", clicks: "28,700+", before: "Looking for ", highlight: "coding bootcamps", after: " that are worth it?", ups: 97, comments: 30 },
      { sub: "r/fitness", time: "1y ago", members: "2.8m Members", online: "11.5k", clicks: "18,500+", before: "Looking for ", highlight: "workout programs", after: " for beginners", ups: 68, comments: 20 },
      { sub: "r/investing", time: "9mo ago", members: "1.9m Members", online: "7.8k", clicks: "14,200+", before: "", highlight: "Investment courses", after: " worth the money?", ups: 55, comments: 12 },
    ],
  },
  {
    key: "affiliate",
    label: "Affiliate Marketers",
    icon: "🔗",
    posts: [
      { sub: "r/fitness", time: "1y ago", members: "2.8m Members", online: "11.5k", clicks: "18,500+", before: "What ", highlight: "protein powder", after: " do you recommend?", ups: 77, comments: 23 },
      { sub: "r/camping", time: "8mo ago", members: "1.4m Members", online: "6.2k", clicks: "11,200+", before: "", highlight: "Essential camping gear", after: " for beginners?", ups: 80, comments: 23 },
      { sub: "r/diy", time: "5mo ago", members: "27.4m Members", online: "42.3k", clicks: "45,200+", before: "What are the ", highlight: "best power tools", after: " for beginners?", ups: 50, comments: 11 },
    ],
  },
  {
    key: "local",
    label: "Local Businesses",
    icon: "📍",
    posts: [
      { sub: "r/losangeles", time: "3mo ago", members: "580k Members", online: "2.8k", clicks: "8,900+", before: "Need a reliable ", highlight: "plumber in West LA", after: "", ups: 47, comments: 15 },
      { sub: "r/nyc", time: "6mo ago", members: "720k Members", online: "4.5k", clicks: "12,400+", before: "", highlight: "Best pizza places", after: " in Brooklyn?", ups: 56, comments: 13 },
      { sub: "r/chicago", time: "4mo ago", members: "490k Members", online: "2.1k", clicks: "7,600+", before: "Looking for a trustworthy ", highlight: "mechanic", after: " near Logan Square", ups: 89, comments: 16 },
    ],
  },
];

const AVATAR_COLORS = ["#f2a83b", "#60a5fa", "#f472b6", "#34d399", "#a78bfa", "#fb923c"];

function avatarColor(sub) {
  let h = 0;
  for (let i = 0; i < sub.length; i++) h = (h * 31 + sub.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function PostCard({ post }) {
  return (
    <div className="card bm-post-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 26, height: 26, borderRadius: "50%", background: avatarColor(post.sub), flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{post.sub}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· {post.time}</span>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "var(--accent-dim)", color: "var(--accent-3)", whiteSpace: "nowrap" }}>
          {post.clicks} Monthly Clicks
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
        {post.members} · <span style={{ color: "#22c55e" }}>●</span> {post.online} Online
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 14 }}>
        {post.before}
        <span style={{ background: "var(--accent-dim)", color: "var(--accent-3)", padding: "0 4px", borderRadius: 4 }}>{post.highlight}</span>
        {post.after}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
        <span>↑ <strong style={{ color: "var(--text)" }}>{post.ups}</strong> ↓</span>
        <span>💬 {post.comments}</span>
        <span>↗ Share</span>
      </div>
    </div>
  );
}

export default function BusinessModelsSection() {
  const [active, setActive] = useState(CATEGORIES[0].key);
  const category = CATEGORIES.find((c) => c.key === active);

  return (
    <section className="section">
      <div className="container">
        <h2>This Works for Every Business Model</h2>
        <p className="section-sub">
          Reddit threads like this exist in every industry. They rank on Google
          and can sometimes get millions of clicks per month. By placing your
          brand as the top comment in these threads, you'll capture over 90% of
          the traffic.
        </p>

        <div className="bm-panel">
          <div className="bm-tabbar">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`bm-tab${c.key === active ? " is-active" : ""}`}
              >
                <span aria-hidden="true">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          <div className="bm-grid">
            {category.posts.map((post) => (
              <PostCard key={post.sub + post.highlight} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
