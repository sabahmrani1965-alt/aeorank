import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import StepsSection from "@/components/StepsSection";
import HeroVisual from "@/components/HeroVisual";
import FeatureGrid from "@/components/FeatureGrid";
import ProductShowcase from "@/components/ProductShowcase";
import AnnotatedTour from "@/components/AnnotatedTour";
import { CALENDLY_URL } from "@/lib/links";

export default function Home() {
  return (
    <MarketingLayout>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-pill fade-in">
                <span className="dot" /> Live data: fetched from Reddit's public API
              </div>
              <div className="hero-tag fade-in">( AEOrank: Answer Engine Optimization )</div>
              <h1 className="fade-in">
                Rank in <span className="accent">AI Answers</span>
                <br />
                via Reddit signals
              </h1>
              <p className="fade-in">
                See the subreddits, threads, and keywords that influence how
                ChatGPT, Claude, and Gemini talk about your brand, then turn
                that visibility into measurable engagement.
              </p>

              <div className="fade-in" style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/signup" className="btn btn-primary btn-large">
                  Get Started →
                </Link>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-large"
                >
                  Book a Call
                </a>
              </div>
            </div>

            <div className="hero-visual fade-in">
              <HeroVisual />
            </div>
          </div>

          {/* Stats strip */}
          <div className="stats-strip fade-in">
            <div className="stat">
              <div className="stat-value">12K+</div>
              <div className="stat-label">Subreddits indexed</div>
            </div>
            <div className="stat">
              <div className="stat-value">2M+</div>
              <div className="stat-label">Reachable members</div>
            </div>
            <div className="stat">
              <div className="stat-value">3</div>
              <div className="stat-label">Major LLMs analysed</div>
            </div>
            <div className="stat">
              <div className="stat-value">&lt;5s</div>
              <div className="stat-label">Report generation</div>
            </div>
          </div>
        </div>
      </section>

      <ProductShowcase />

      <AnnotatedTour />

      <FeatureGrid />

      {/* WHY THIS MATTERS NOW — replaces the old LLM-mock section. The mocks
          referenced SaaSOffers as if cited by AI, which a curious visitor
          could fact-check and find untrue. This section uses directional
          language and no brand names so nothing is verifiable-and-wrong. */}
      <section className="section">
        <div className="container">
          <span className="section-tag">( why now )</span>
          <h2>
            Search is moving from <span className="accent">Google to AI</span>
          </h2>
          <p className="section-sub">
            Your buyers are asking ChatGPT, Claude, and Gemini the same
            questions they used to type into Google, and clicking maybe two
            links from the answer. The brands those models cite get the
            consideration. The rest don't.
          </p>

          <div className="why-grid">
            <div className="card why-card">
              <div className="why-num">01</div>
              <h3>Buyers ask AI first</h3>
              <p>
                A growing share of B2B research starts in an AI chat, not a
                search bar. The user gets a synthesised answer with two or
                three brands cited. Position 1 on Google can't compete with
                being the brand the AI named.
              </p>
            </div>

            <div className="card why-card">
              <div className="why-num">02</div>
              <h3>AI leans on Reddit</h3>
              <p>
                For category questions like <em>"what's the best X for Y"</em>,
                leading AI assistants pull heavily from Reddit threads,
                comparison guides, and earned media, not from company
                landing pages. If your category is being discussed on
                Reddit and you're not in those threads, you're invisible to AI.
              </p>
            </div>

            <div className="card why-card">
              <div className="why-num">03</div>
              <h3>The window is open</h3>
              <p>
                Most companies are still optimising for SEO. The brands moving
                on AEO right now are claiming AI citations before competitors
                notice the shift. Once a model has settled on its top picks
                for a category, displacing them is much harder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / STEPS — homepage uses SaaSOffers as a showcase example
          with a real dofollow backlink. The same component renders inside each
          report personalised to the visitor's brand. */}
      <StepsSection
        showcase
        brand="SaaSOffers"
        brandUrl="https://saasoffers.tech"
        brandHost="saasoffers.tech"
        topSub="r/SaaS"
      />

      {/* FAQ */}
      <section className="section section-alt" id="faq">
        <div className="container">
          <span className="section-tag">( questions )</span>
          <h2>Frequently asked</h2>
          <p className="section-sub">
            Quick answers about how AEOrank works.
          </p>

          <div className="faq">
            <details>
              <summary>What does AEOrank actually do?</summary>
              <div className="faq-body">
                We help brands show up in AI chat answers (ChatGPT, Claude,
                Gemini) by getting them mentioned in the Reddit conversations
                those models train on. Each engagement is reviewed by you
                before it goes live: no spam, no shortcuts.
              </div>
            </details>
            <details>
              <summary>Where does the Reddit data come from?</summary>
              <div className="faq-body">
                Reddit's public JSON endpoints (the same data Reddit's own
                search uses). It's purely read-only. We don't post, vote, or
                modify anything in your name without explicit approval.
              </div>
            </details>
            <details>
              <summary>How accurate is the keyword data?</summary>
              <div className="faq-body">
                Base estimates are directional, generated from your site's
                metadata and Reddit signals. Paid plans get audit-grade
                keyword data sourced from third-party providers.
              </div>
            </details>
            <details>
              <summary>Do you guarantee citations in ChatGPT or Claude?</summary>
              <div className="faq-body">
                No, nobody can guarantee what an LLM will say. We focus on
                measurable signals: Reddit visibility, branded search lift, and
                tracked references over time. The "AI Visibility Score" in
                paid plans tracks these movements transparently.
              </div>
            </details>
            <details>
              <summary>Is this allowed under Reddit's rules?</summary>
              <div className="faq-body">
                We follow each subreddit's posting guidelines and disclose
                affiliations where required. We do not run vote rings or
                operate fake accounts. If a community doesn't want commercial
                content, we don't post there.
              </div>
            </details>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
