import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KeywordChart from "@/components/KeywordChart";
import LlmMock from "@/components/LlmMock";
import PricingTiers from "@/components/PricingTiers";
import StepsSection from "@/components/StepsSection";
import { fetchSiteMeta, prettyBrand, extractBrandFromTitle } from "@/lib/site";
import {
  heuristicKeywords,
  enrichKeywordsWithVolumes,
  totalsFromKeywords,
  pickCategoryQuery,
} from "@/lib/keywords";
import { searchSubreddits, searchPosts, formatMembers, timeAgo } from "@/lib/reddit";
import { generateKeywordsFromLlm, isLlmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const brand = prettyBrand(params.brand);
  return {
    title: `${brand} — Reddit & AI Visibility Report | AEOrank`,
  };
}

function SubIcon({ name, icon }) {
  const letter = (name || "?").replace(/^r\//, "")[0]?.toUpperCase() || "?";
  if (icon) {
    return (
      <span
        className="sub-icon"
        style={{ backgroundImage: `url(${icon})`, backgroundColor: "#1a1a1b" }}
      >
        <span style={{ visibility: "hidden" }}>{letter}</span>
      </span>
    );
  }
  return <span className="sub-icon">{letter}</span>;
}

export default async function ReportPage({ params, searchParams }) {
  const enteredUrl = searchParams?.url || "";

  // 1. Site metadata — fetched first so we can derive a better brand name from the title
  let meta = { title: "", description: "", ok: false };
  if (enteredUrl) {
    try { meta = await fetchSiteMeta(enteredUrl); } catch {}
  }
  // Prefer a clean brand from the page title; fall back to slug-based heuristics
  const brand = extractBrandFromTitle(meta.title) || prettyBrand(params.brand);
  const description = meta.description || meta.title || `${brand} platform`;

  // 2. Keywords — try Claude first (real, brand-specific), fall back to heuristics.
  // 3. Reddit data — use a category query (e.g. "SaaS startup") for community
  //    search and brand + category for post search. This avoids generic single
  //    words ("access", "tools") pulling political subreddits.
  const categoryQuery = pickCategoryQuery(description, brand);
  const postQuery = `${brand} ${categoryQuery}`;

  const llmEnabled = isLlmConfigured();

  const [subA, postsA, postsB, llmKeywords] = await Promise.all([
    searchSubreddits(categoryQuery, 12),
    searchPosts(postQuery, 8),
    searchPosts(categoryQuery, 6),
    llmEnabled
      ? generateKeywordsFromLlm(brand, description, 20)
      : Promise.resolve(null),
  ]);
  const subB = [];

  // Build the keyword rows: prefer Claude phrases, fall back to heuristics.
  const keywordPhrases = llmKeywords && llmKeywords.length >= 5
    ? llmKeywords
    : heuristicKeywords(brand, description, 20);
  const keywords = enrichKeywordsWithVolumes(brand, keywordPhrases);
  const totals = totalsFromKeywords(keywords);

  // Dedupe + cap
  const subreddits = [...new Map(
    [...subA, ...subB].map((s) => [s.name, s])
  ).values()].slice(0, 12);

  const posts = [...new Map(
    [...postsA, ...postsB].map((p) => [p.permalink, p])
  ).values()]
    .sort((a, b) => b.ups - a.ups)
    .slice(0, 10);

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="report-hero">
        <div className="container">
          <div className="hero-pill" style={{ marginBottom: 16 }}>
            <span className="dot" /> Live report — generated {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="hero-tag">( Your custom report )</div>
          <h1>
            Here's How We Can Help <span className="accent">{brand}</span>
            <br />
            Drive Traffic from Reddit
          </h1>
          <p>
            We scanned Reddit for threads related to <strong>{brand}</strong>
            {meta.ok && meta.description ? (
              <>
                {" "}— a site described as “
                <em style={{ color: "var(--text)" }}>
                  {meta.description.slice(0, 140)}
                  {meta.description.length > 140 ? "…" : ""}
                </em>
                ”.
              </>
            ) : (
              "."
            )}
          </p>
        </div>
      </section>

      {/* Keywords */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-icon">
            <span className="icon-box">⚿</span>
            <h3>Estimated Keyword Opportunities</h3>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-header-text">
                Directional estimate based on your site's metadata for:{" "}
                <span className="quoted">"{brand}"</span>
              </div>
              <div className="chart-legend">
                <span className="chart-legend-item">
                  <span className="chart-legend-dot" /> Est. monthly interest
                </span>
                <span className="chart-legend-item">
                  <span className="chart-legend-dot dim" /> Est. capture potential
                </span>
              </div>
            </div>
            <KeywordChart rows={keywords} />
          </div>

          <div className="kpi-row">
            <div className="kpi">
              <div className="kpi-label">Keywords identified</div>
              <div className="kpi-value">{totals.count}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Estimated monthly searches</div>
              <div className="kpi-value">{totals.monthly.toLocaleString()}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Potential traffic</div>
              <div className="kpi-value">{totals.potential.toLocaleString()}</div>
            </div>
          </div>

          <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>
            Free reports use heuristic estimates from your site's metadata.
            Paid plans include audit-grade keyword data from third-party providers.
          </p>
        </div>
      </section>

      {/* Subreddits */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-icon">
            <span className="icon-box">★</span>
            <h3>Top Subreddit Opportunities</h3>
          </div>

          {subreddits.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              Reddit returned no subreddit matches. Try a different URL.
            </div>
          ) : (
            <>
              <div className="sub-grid">
                {subreddits.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sub-card"
                  >
                    <div className="sub-head">
                      <SubIcon name={s.name} icon={s.icon} />
                      <div className="sub-name">{s.name}</div>
                    </div>
                    <div className="sub-desc">{s.desc || "—"}</div>
                    <div className="sub-members">
                      {formatMembers(s.members)} members
                    </div>
                  </a>
                ))}
              </div>
              <div className="audience-block" style={{ marginTop: 24 }}>
                <div className="audience-num">
                  {formatMembers(subreddits.reduce((s, x) => s + x.members, 0))}+
                </div>
                <div className="audience-label">Combined audience reachable</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="section">
        <div className="container">
          <span className="section-tag">( Relevant Posts )</span>
          <h2>Top Reddit Posts About {brand}</h2>
          <p className="section-sub">
            Live results from Reddit's public search API for queries related to{" "}
            <strong>{brand}</strong>. Click a post to read it on Reddit.
          </p>

          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No matching posts found in the last month.
            </div>
          ) : (
            <div className="post-grid">
              {posts.map((p) => (
                <a
                  key={p.permalink}
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-card"
                >
                  <div className="post-meta">
                    <SubIcon name={p.sub} />
                    <span>{p.sub}</span>
                    <span>·</span>
                    <span>{timeAgo(p.created)}</span>
                    <span>·</span>
                    <span>u/{p.author}</span>
                  </div>
                  <div className="post-title">{p.title}</div>
                  {p.snippet && <div className="post-snippet">{p.snippet}…</div>}
                  <div className="post-stats">
                    <span className="post-stat">↑ {p.ups.toLocaleString()}</span>
                    <span className="post-stat">💬 {p.comments.toLocaleString()}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI citation section — projected future state showing how AI could
          mention the brand once AEOrank establishes its Reddit footprint. */}
      <section className="section section-alt">
        <div className="container">
          <span className="section-tag">( projected outcome )</span>
          <h2>
            Driving Visibility Across <span className="accent">Leading AI Models</span>
          </h2>
          <p className="section-sub">
            Once we've established <strong>{brand}</strong>'s Reddit footprint,
            here's how leading AI assistants could surface your brand when
            users ask about your category. Sample formats — actual phrasing
            varies by model and query.
          </p>

          <div className="llm-grid">
            {[
              { model: "gpt", q: `What are some good options to consider in ${categoryQuery}?` },
              { model: "claude", q: `Where do people recommend ${brand} online?` },
              { model: "gemini", q: `Tell me about ${brand} and how teams use it.` },
            ].map((s, i) => (
              <LlmMock key={i} model={s.model} badge="Projected" question={s.q}>
                {i === 0 && (
                  <>
                    There are several platforms worth exploring. Alongside the
                    well-known names in the space, you should also consider{" "}
                    <span className="highlight">{brand}</span>, which has built
                    a strong reputation across Reddit communities like{" "}
                    {subreddits.slice(0, 2).map((sub, j) => (
                      <span key={sub.name}>
                        <span className="highlight">{sub.name}</span>
                        {j < Math.min(subreddits.length, 2) - 1 ? " and " : ""}
                      </span>
                    ))}{" "}
                    where users consistently recommend it.
                  </>
                )}
                {i === 1 && (
                  <>
                    Looking through public discussions,{" "}
                    <span className="highlight">{brand}</span> comes up
                    frequently in conversations on{" "}
                    {subreddits.slice(0, 2).map((sub, j) => (
                      <span key={sub.name}>
                        <span className="highlight">{sub.name}</span>
                        {j < Math.min(subreddits.length, 2) - 1 ? " and " : ""}
                      </span>
                    ))}
                    , where users share positive experiences and concrete
                    use cases that make it a top recommendation.
                  </>
                )}
                {i === 2 && (
                  <>
                    <span className="highlight">{brand}</span> is widely
                    referenced across online communities, including{" "}
                    {subreddits.slice(0, 2).map((sub, j) => (
                      <span key={sub.name}>
                        <span className="highlight">{sub.name}</span>
                        {j < Math.min(subreddits.length, 2) - 1 ? " and " : ""}
                      </span>
                    ))}
                    , where teams describe how they've integrated it into
                    their workflows and the results they've seen.
                  </>
                )}
              </LlmMock>
            ))}
          </div>

          <p style={{ marginTop: 20, color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
            These are sample formats demonstrating how brand mentions surface
            in AI answers. AEOrank tracks real LLM citations for paying customers.
          </p>
        </div>
      </section>

      {/* STEPS — personalised to the brand from the report */}
      <StepsSection
        brand={brand}
        brandUrl={enteredUrl || `https://${brand.toLowerCase().replace(/\s+/g, "")}.com`}
        brandHost={(() => {
          try {
            return new URL(enteredUrl).hostname.replace(/^www\./, "");
          } catch {
            return `${brand.toLowerCase().replace(/\s+/g, "")}.com`;
          }
        })()}
        description={description}
        categoryQuery={categoryQuery}
        topSub={subreddits[0]?.name || "r/general"}
      />

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="container">
          <span className="section-tag">( pricing )</span>
          <h2>
            Ready to grow <span className="accent">{brand}</span>'s AI visibility?
          </h2>
          <p className="section-sub">
            Choose a plan that fits your stage. Cancel any time.
          </p>
          <PricingTiers />
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <a href="/contact" className="btn btn-primary btn-large">
            Get a custom strategy →
          </a>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
            Talk to our team about turning these signals into measurable AI visibility.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
