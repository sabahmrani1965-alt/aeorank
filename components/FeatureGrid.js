import LineIcon from "@/components/LineIcon";

// Real, shipped features only — no invented capabilities. Each line maps
// directly to something in the dashboard: Opportunities, Mentions, Prompts,
// Reports (AI Visibility), draft generation, multi-brand, credits.
const FEATURES = [
  {
    icon: "target",
    title: "AI Visibility Score",
    desc: "Track how ChatGPT, Claude, Gemini, and Perplexity talk about your brand, and how that shifts over time.",
  },
  {
    icon: "search",
    title: "Reddit Opportunities",
    desc: "Real Reddit threads where your ideal buyers are already asking, ranked by relevance to what you offer.",
  },
  {
    icon: "message",
    title: "Mention Tracking",
    desc: "Every Reddit post or comment that already references your brand, with sentiment: positive, neutral, or negative.",
  },
  {
    icon: "tag",
    title: "Keyword Tracking",
    desc: "Add the keywords your buyers search for to sharpen your Reddit opportunities, with real conversation volume for each.",
  },
  {
    icon: "prompt",
    title: "Prompt Tracking",
    desc: "Track the exact buyer questions that should mention your brand, and see whether AI actually answers with it.",
  },
  {
    icon: "pen",
    title: "AI Writing Assistant",
    desc: "AI drafts comments, replies, and posts. You approve them, and we publish them from our own Reddit accounts as natural contributions.",
  },
  {
    icon: "scale",
    title: "Competitor Benchmarking",
    desc: "See which competitors AI names instead of you, and how often, across every answer we check.",
  },
  {
    icon: "layers",
    title: "Multi-Brand Management",
    desc: "Track multiple brands from one account, each with its own opportunities, mentions, and reports.",
  },
  {
    icon: "card",
    title: "Usage-Based Credits",
    desc: "Pay only for what you generate. Top up anytime, no forced tiers.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( everything included )</span>
        <h2>
          Everything you need for <span className="accent">AI visibility</span>
        </h2>
        <p className="section-sub">
          From tracking where you stand today, to writing the content that moves the needle tomorrow.
        </p>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="card feature-card">
              <div className="feature-icon"><LineIcon name={f.icon} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
