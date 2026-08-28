import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";

export const metadata = {
  title: "Blog: AEOrank",
  description:
    "Practical AEO and Answer Engine Optimization guides, research, and notes for B2B SaaS marketers winning in the age of AI search.",
  alternates: { canonical: "https://www.aeorank.tech/blog" },
};

const posts = [
  {
    tag: "AEO · Comparison",
    title: "CrowdReply vs. AEOrank: What Each One Actually Does",
    excerpt:
      "CrowdReply and AEOrank overlap more than most AI visibility tools. An honest look at pricing, how each one actually posts to Reddit, and which fits which team.",
    date: "August 28, 2026",
    readTime: "6 min read",
    slug: "crowdreply-vs-aeorank",
  },
  {
    tag: "AEO · Methodology",
    title: "How We Verify a Reddit Thread Before It Ever Reaches You",
    excerpt:
      "A search snippet showing no replies isn't proof a thread is unanswered. What we actually check before flagging a thread as a real opportunity.",
    date: "August 28, 2026",
    readTime: "5 min read",
    slug: "how-we-verify-reddit-threads",
  },
  {
    tag: "AEO · Claude",
    title: "Getting Cited by Claude: Why It's the Hardest Engine to Crack",
    excerpt:
      "Claude declines to recommend products more often than any other major engine. What it actually trusts when it does cite, and a realistic timeline for earning one.",
    date: "August 27, 2026",
    readTime: "7 min read",
    slug: "getting-cited-by-claude",
  },
  {
    tag: "AEO · Sentiment",
    title: "Why Being Mentioned Isn't Enough: Sentiment in AI Citations",
    excerpt:
      "A citation isn't automatically good. One paired with 'some say to avoid this' does real damage. How that happens, and how to fix it.",
    date: "August 27, 2026",
    readTime: "6 min read",
    slug: "sentiment-in-ai-citations",
  },
  {
    tag: "AEO · Growth",
    title: "Using Your Own Partner Network for AI Visibility",
    excerpt:
      "Your existing affiliates already have a reason to talk to you. Why that makes your partner network a warmer, faster channel than cold outreach.",
    date: "August 27, 2026",
    readTime: "6 min read",
    slug: "partner-network-ai-visibility",
  },
  {
    tag: "AEO · Reddit",
    title: "How to Reply to a Reddit Thread Without Getting It Removed",
    excerpt:
      "One of our own outreach targets got pulled by mods for 'unapproved third-party advertisement.' What that rule actually means and how to reply without triggering it.",
    date: "August 27, 2026",
    readTime: "6 min read",
    slug: "reply-to-reddit-without-getting-removed",
  },
  {
    tag: "AEO · Comparisons",
    title: "Profound vs. Peec AI vs. AEOrank: What Each One Actually Does",
    excerpt:
      "Not a \"why we're better\" pitch. An honest breakdown of what each tool actually measures or does, and why they're not really competing for the same budget line.",
    date: "August 27, 2026",
    readTime: "6 min read",
    slug: "profound-vs-peec-vs-aeorank",
  },
  {
    tag: "AEO · Reddit",
    title:
      "Why ChatGPT and Perplexity Cite Reddit Threads (And What Happens If You're Not In Them)",
    excerpt:
      "We checked 30 real B2B SaaS companies for a live, unanswered Reddit thread in their category. Found one in nearly all of them. Here's what that costs.",
    date: "August 27, 2026",
    readTime: "8 min read",
    slug: "why-chatgpt-cites-reddit-threads",
  },
  {
    tag: "AEO · Fundamentals",
    title: "What Is AEO (Answer Engine Optimization)? The Complete Guide",
    excerpt:
      "The plain-English definition, how it differs from SEO and GEO, the five building blocks that actually make up the discipline, and where to start.",
    date: "July 26, 2026",
    readTime: "12 min read",
    slug: "what-is-aeo",
  },
  {
    tag: "AEO · Schema",
    title: "AEO Schema Markup: The Tags That Actually Move AI Citations",
    excerpt:
      "Most schema advice is recycled SEO with 'AEO' stamped on top. The schema types that actually move AI citations for B2B SaaS, ranked by impact.",
    date: "April 24, 2026",
    readTime: "9 min read",
    slug: "aeo-schema-markup-guide",
  },
  {
    tag: "AEO · Multi-LLM",
    title: "ChatGPT vs Claude vs Gemini: Why Your Brand Shows Up Differently in Each",
    excerpt:
      "Same query, different brands cited. ChatGPT, Claude, and Gemini build their answers from different signals. How each one actually behaves and what to do about it.",
    date: "April 17, 2026",
    readTime: "10 min read",
    slug: "chatgpt-vs-claude-vs-gemini-citations",
  },
  {
    tag: "AEO · Strategy",
    title: "Getting Your SaaS Cited by ChatGPT: What Actually Works in 2026",
    excerpt:
      "Six months of testing what moves AI citations and what doesn't. Entity work matters more than content volume. Third-party citations matter more than either.",
    date: "April 10, 2026",
    readTime: "9 min read",
    slug: "how-to-get-cited-by-chatgpt",
  },
  {
    tag: "AEO · Measurement",
    title: "Measuring AEO ROI Without Lying to Yourself",
    excerpt:
      "Most AI attribution is guesswork dressed up as data. The honest framework for figuring out whether AEO is actually working, what it's worth, and when to stop.",
    date: "April 3, 2026",
    readTime: "7 min read",
    slug: "measure-ai-citation-roi",
  },
  {
    tag: "Entity SEO · AEO",
    title: "The Real Reason Some SaaS Brands Get Cited by AI and Others Don't",
    excerpt:
      "Spoiler: it's almost never the content. It's entity authority. What that actually means and why most SaaS companies are bad at it.",
    date: "March 27, 2026",
    readTime: "11 min read",
    slug: "entity-authority-ai-citation",
  },
  {
    tag: "AEO · Perplexity",
    title: "Perplexity Is Different. Here's What It Actually Wants.",
    excerpt:
      "Perplexity is where the highest-intent technical buyers actually research. It retrieves differently. It weights differently. Here's what matters.",
    date: "March 20, 2026",
    readTime: "7 min read",
    slug: "optimize-for-perplexity",
  },
  {
    tag: "AEO vs SEO",
    title: "AEO vs SEO: Stop Pretending They're the Same Job",
    excerpt:
      "Most agencies selling AEO are just rebranding SEO services. They're not the same discipline. How they actually differ and why both still matter.",
    date: "March 13, 2026",
    readTime: "8 min read",
    slug: "aeo-vs-seo",
  },
  {
    tag: "Google AI · AEO",
    title:
      "Google AI Overviews: What We've Learned After a Year of Optimization",
    excerpt:
      "AI Overviews went from annoying feature to dominant placement. What gets featured, what doesn't, and what's changed since launch.",
    date: "March 6, 2026",
    readTime: "10 min read",
    slug: "google-ai-overviews-guide",
  },
];

export default function Blog() {
  const [featured, ...rest] = posts;
  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( the blog )</span>
          <h2>
            Notes on the <span className="accent">answer engine</span> game
          </h2>
          <p className="section-sub">
            Practical AEO strategies, research, and field reports for B2B SaaS
            marketers who want to win in the age of AI search.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {/* Featured */}
          <Link
            href={`/blog/${featured.slug}`}
            className="card"
            style={{
              display: "block",
              marginBottom: 32,
              textDecoration: "none",
              color: "inherit",
              padding: 32,
              borderColor: "rgba(242, 168, 59, 0.25)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 12,
              }}
            >
              Featured · {featured.tag}
            </div>
            <h3 style={{ marginBottom: 14, fontSize: 26, lineHeight: 1.25 }}>
              {featured.title}
            </h3>
            <p style={{ color: "var(--text-dim)", marginBottom: 18, lineHeight: 1.7 }}>
              {featured.excerpt}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <span>{featured.date}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{featured.readTime}</span>
              <span style={{ marginLeft: "auto", color: "var(--accent)", fontWeight: 600 }}>
                Read article →
              </span>
            </div>
          </Link>

          {/* Rest */}
          <div
            className="post-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}
          >
            {rest.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  {p.tag}
                </div>
                <h4 style={{ fontSize: 18, lineHeight: 1.35, fontWeight: 700 }}>
                  {p.title}
                </h4>
                <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, flex: 1 }}>
                  {p.excerpt}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: "auto",
                  }}
                >
                  <span>{p.date}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{p.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
