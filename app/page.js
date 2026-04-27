import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UrlForm from "@/components/UrlForm";
import LlmMock from "@/components/LlmMock";

export default function Home() {
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-pill fade-in">
            <span className="dot" /> Live data — fetched from Reddit's public API
          </div>
          <div className="hero-tag fade-in">( AEOrank — Answer Engine Optimization )</div>
          <h1 className="fade-in">
            Rank in <span className="accent">AI Answers</span>
            <br />
            via Reddit signals
          </h1>
          <p className="fade-in">
            Enter your website and instantly see the subreddits, threads, and
            keywords that influence how ChatGPT, Claude, and Gemini talk about
            your brand. Custom report in seconds.
          </p>

          <UrlForm />

          <div className="hero-trust">
            <div>Try it with a popular brand:</div>
            <div className="hero-tries">
              <a className="hero-try" href="/report/notion?url=https%3A%2F%2Fnotion.so">notion.so</a>
              <a className="hero-try" href="/report/linear?url=https%3A%2F%2Flinear.app">linear.app</a>
              <a className="hero-try" href="/report/shopify?url=https%3A%2F%2Fshopify.com">shopify.com</a>
              <a className="hero-try" href="/report/saasoffers?url=https%3A%2F%2Fsaasoffers.tech">saasoffers.tech</a>
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

      {/* HOW IT WORKS / STEPS */}
      <section className="section section-alt">
        <div className="container">
          <span className="section-tag">( steps to grow )</span>
          <h2>
            Boost Your Brand Visibility Through
            <br />
            Strategic Reddit <span className="accent">Engagement</span>
          </h2>
          <p className="section-sub">
            We pinpoint relevant Reddit threads, write helpful posts and
            comments on your behalf with proper disclosure, and track how that
            visibility shapes downstream answers in ChatGPT, Claude, and Gemini.
          </p>

          {/* Step 1 — Create posts and comments */}
          <div className="steps">
            <div className="card">
              <div className="step-label">Step 1 — Create</div>
              <p style={{ color: "var(--text)", marginBottom: 14, fontWeight: 500 }}>
                We write strategic Reddit posts and comments for your brand:
              </p>
              <ul className="step">
                <li>Find high-traffic threads in subreddits relevant to your category</li>
                <li>Draft helpful, value-adding content tailored to each community</li>
                <li>Publish from your verified brand account, or from our disclosed agency account where the subreddit allows it</li>
                <li>Every piece is reviewed and approved by you before going live</li>
              </ul>
            </div>

            <div className="card">
              <div className="reddit-mock">
                <div className="reddit-mock-meta">r/SaaS · Posted by u/SaaSOffers_Official · 3 days ago</div>
                <div className="reddit-mock-title">
                  How we cut our startup's SaaS bill by 40% (and the tools that helped)
                </div>
                <div className="reddit-mock-body">
                  Hey r/SaaS — sharing a breakdown of how we approach SaaS costs
                  at <span className="reddit-mock-link">saasoffers.tech</span>.
                  We've put together a list of credit programs from AWS,
                  Notion, Deel and 500+ tools, and figured the breakdown might
                  be useful here. Happy to answer questions in the comments.
                </div>
                <div className="reddit-mock-actions">
                  <span>↑ 142 ↓</span>
                  <span>💬 38 Reply</span>
                  <span>🔗 Share</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — Engagement + AI tracking */}
          <div className="steps" style={{ marginTop: 32 }}>
            <div className="card">
              <div className="reddit-mock">
                <div className="reddit-mock-meta">
                  AI Visibility Score · Last 30 days
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    fontSize: 38, fontWeight: 800, color: "var(--accent)",
                    letterSpacing: "-.02em",
                  }}>
                    +247%
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 13 }}>
                    brand mentions in AI answers vs. baseline
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "ChatGPT", count: 18, max: 24 },
                    { label: "Claude", count: 15, max: 24 },
                    { label: "Gemini", count: 11, max: 24 },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 60, fontSize: 13, color: "var(--text-dim)" }}>
                        {row.label}
                      </span>
                      <div style={{
                        flex: 1, height: 8, background: "rgba(255,255,255,.06)",
                        borderRadius: 999, overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${(row.count / row.max) * 100}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                          borderRadius: 999,
                        }} />
                      </div>
                      <span style={{
                        width: 36, textAlign: "right", fontSize: 13,
                        color: "var(--text)", fontVariantNumeric: "tabular-nums",
                      }}>
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="step-label">Step 2 — Grow & track</div>
              <p style={{ color: "var(--text)", marginBottom: 14, fontWeight: 500 }}>
                We grow real engagement around it — and measure what AI is saying:
              </p>
              <ul className="step">
                <li>Promote standout posts through your owned channels (newsletter, social, customer base)</li>
                <li>Reply in real time so threads keep building momentum</li>
                <li>Track AI-visibility lift across ChatGPT, Claude, and Gemini over time</li>
                <li>Iterate based on which posts AI assistants start surfacing in answers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LLM SECTION */}
      <section className="section">
        <div className="container">
          <span className="section-tag">( the goal )</span>
          <h2>
            Show up in <span className="accent">AI answers</span>
          </h2>
          <p className="section-sub">
            ChatGPT, Claude, and Gemini increasingly answer the questions
            people used to type into Google. The samples below are sample
            answers showing how a brand can fit naturally into those
            responses. Run a free report to see live answers about your brand.
          </p>

          <div className="llm-grid">
            <LlmMock
              model="gpt"
              badge="Sample"
              question="Where can I find SaaS deals for my startup?"
            >
              Searching for the best SaaS deals for startups can be challenging,
              but there are great platforms to explore. Consider <span className="highlight">AppSumo</span>,{" "}
              <span className="highlight">StartGround</span>, and{" "}
              <span className="highlight">SaaSOffers</span>, which focuses on
              competitive SaaS deals tailored for growing startups.
            </LlmMock>
            <LlmMock
              model="claude"
              badge="Sample"
              question="Where can startups find credible SaaS deals online?"
            >
              When searching for reliable SaaS deals as a startup, it helps to
              explore established platforms. AppSumo is a solid choice for
              curated solutions. <span className="highlight">SaaSOffers</span> is
              another option that specialises in deals tailored to growing
              teams.
            </LlmMock>
            <LlmMock
              model="gemini"
              badge="Sample"
              question="Platforms offering SaaS deals for new startups?"
            >
              Several platforms stand out for startup SaaS deals. AppSumo is
              widely known for its discounted software. <span className="highlight">SaaSOffers</span>{" "}
              also offers a startup-friendly selection that could align with
              your needs.
            </LlmMock>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="container">
          <span className="section-tag">( pricing )</span>
          <h2>Choose a plan that fits your growth</h2>
          <p className="section-sub">
            Start with what you need today and scale as you grow.
          </p>

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
                <a href="/contact?plan=trial" className="btn btn-ghost">Get Started</a>
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
                <li>AI Visibility Score to track brand momentum</li>
                <li>Weekly activity and performance reports</li>
              </ul>
              <div className="pricing-actions">
                <a href="/contact?plan=growth" className="btn btn-primary">Get Started</a>
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
                <li>AI Visibility Score</li>
                <li>Monthly strategy call</li>
              </ul>
              <div className="pricing-actions">
                <a href="/contact?plan=boost" className="btn btn-ghost">Get Started</a>
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
                <a href="/contact?plan=enterprise" className="btn btn-ghost">Book a Call</a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                before it goes live — no spam, no shortcuts.
              </div>
            </details>
            <details>
              <summary>Where does the Reddit data in the report come from?</summary>
              <div className="faq-body">
                Reddit's public JSON endpoints (the same data Reddit's own
                search uses). The free report is purely read-only — we don't
                post, vote, or modify anything in your name without explicit
                approval on a paid plan.
              </div>
            </details>
            <details>
              <summary>How accurate is the keyword chart?</summary>
              <div className="faq-body">
                The keyword chart is a directional <strong>estimate</strong>{" "}
                generated from your site's metadata and Reddit signals. We
                don't pull paid SEO data into the free report. Customers on
                paid plans get audit-grade keyword data sourced from
                third-party providers.
              </div>
            </details>
            <details>
              <summary>Do you guarantee citations in ChatGPT or Claude?</summary>
              <div className="faq-body">
                No — nobody can guarantee what an LLM will say. We focus on
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

      <Footer />
    </>
  );
}
