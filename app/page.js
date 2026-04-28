import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UrlForm from "@/components/UrlForm";
import StepsSection from "@/components/StepsSection";

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
            questions they used to type into Google — and clicking maybe two
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
                comparison guides, and earned media — not from company
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
