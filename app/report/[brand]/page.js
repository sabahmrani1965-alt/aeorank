import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KeywordChart from "@/components/KeywordChart";
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
import { analyzeBrandVisibility, isAiVisibilityConfigured } from "@/lib/aivisibility";

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

  // Run brand-specific search AND category fallback in parallel. We need
  // them parallel (not sequential) because each Apify call can take up to
  // ~28s, and the page function only has 30s before Vercel kills it. After
  // both return we pick: brand-specific posts if any came back, otherwise
  // the category fallback rendered as "engagement opportunities".
  const [subreddits, brandPosts, opportunityPosts, llmKeywords, aiVisibility] =
    await Promise.all([
      searchSubreddits(categoryQuery, 12),
      searchPosts(postQuery, 8),
      searchPosts(categoryQuery, 6),
      llmEnabled
        ? generateKeywordsFromLlm(brand, description, 20)
        : Promise.resolve(null),
      isAiVisibilityConfigured()
        ? analyzeBrandVisibility(brand, categoryQuery)
        : Promise.resolve({ score: null, total: 0, hits: 0, rows: [] }),
    ]);

  const postsAreOpportunities = !brandPosts || brandPosts.length === 0;
  const postsRaw = postsAreOpportunities ? opportunityPosts : brandPosts;

  // Build the keyword rows: prefer Claude phrases, fall back to heuristics.
  const keywordPhrases = llmKeywords && llmKeywords.length >= 5
    ? llmKeywords
    : heuristicKeywords(brand, description, 20);
  const keywords = enrichKeywordsWithVolumes(brand, keywordPhrases);
  const totals = totalsFromKeywords(keywords);

  const posts = [...new Map(postsRaw.map((p) => [p.permalink, p])).values()]
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
                    {s.desc ? <div className="sub-desc">{s.desc}</div> : null}
                    {s.members > 0 ? (
                      <div className="sub-members">
                        {formatMembers(s.members)} members
                      </div>
                    ) : (
                      <div className="sub-members sub-members-active">
                        <span className="sub-active-dot" />
                        Active community
                      </div>
                    )}
                  </a>
                ))}
              </div>
              {subreddits.some((s) => s.members > 0) && (
                <div className="audience-block" style={{ marginTop: 24 }}>
                  <div className="audience-num">
                    {formatMembers(subreddits.reduce((s, x) => s + x.members, 0))}+
                  </div>
                  <div className="audience-label">Combined audience reachable</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="section">
        <div className="container">
          {postsAreOpportunities ? (
            <>
              <span className="section-tag">( engagement opportunities )</span>
              <h2>
                Threads where <span className="accent">{brand}</span> can win attention
              </h2>
              <p className="section-sub">
                No one's mentioning <strong>{brand}</strong> on Reddit yet — that's the gap. These are popular threads in your category right now: prime targets to <strong>reply with value</strong>, or to inspire <strong>posts of your own</strong> that own the same topic.
              </p>
            </>
          ) : (
            <>
              <span className="section-tag">( Relevant Posts )</span>
              <h2>Top Reddit Posts About {brand}</h2>
              <p className="section-sub">
                Live results from Reddit's public search API for queries related to{" "}
                <strong>{brand}</strong>. Click a post to read it on Reddit.
              </p>
            </>
          )}

          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              No relevant threads found in the last month for this category.
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
                    {p.author ? (
                      <>
                        <span>·</span>
                        <span>u/{p.author}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="post-title">{p.title}</div>
                  {p.snippet && <div className="post-snippet">{p.snippet}…</div>}
                  {(p.ups > 0 || p.comments > 0) && (
                    <div className="post-stats">
                      {p.ups > 0 && (
                        <span className="post-stat">↑ {p.ups.toLocaleString()}</span>
                      )}
                      {p.comments > 0 && (
                        <span className="post-stat">💬 {p.comments.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LIVE AI visibility check — we actually query Perplexity (live web)
          and Claude right now and report, honestly, whether the brand shows
          up. Nothing here is simulated. The gap is the sales argument. */}
      {aiVisibility.rows.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <span className="section-tag">( live AI visibility check )</span>
            <h2>
              How AI Answers About Your Category —{" "}
              <span className="accent">Right Now</span>
            </h2>
            <p className="section-sub">
              We just asked Gemini (with live Google Search grounding) and
              Claude the questions your buyers actually ask. These are their{" "}
              <strong>real, unedited answers</strong> — run them yourself and
              you'll get the same. Here's whether <strong>{brand}</strong>{" "}
              showed up.
            </p>

            {/* Score card */}
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: 32,
                marginBottom: 24,
                borderColor:
                  aiVisibility.score >= 50
                    ? "rgba(110, 231, 183, 0.4)"
                    : "rgba(242, 168, 59, 0.4)",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                AI Visibility Score
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: aiVisibility.score >= 50 ? "#6EE7B7" : "var(--accent)",
                }}
              >
                {aiVisibility.score}%
              </div>
              <div style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 15 }}>
                <strong>{brand}</strong> appeared in{" "}
                <strong>{aiVisibility.hits}</strong> of{" "}
                <strong>{aiVisibility.total}</strong> real AI answers about your
                category.
              </div>
              <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14, maxWidth: 560, margin: "14px auto 0" }}>
                {aiVisibility.score === 0
                  ? `AI is recommending other brands to your buyers — and not naming ${brand} at all. That's the gap we close.`
                  : aiVisibility.score < 50
                  ? `AI mentions ${brand} occasionally, but your competitors are getting named more often. There's clear room to dominate.`
                  : `${brand} already shows up in AI answers. The work now is defending that position and widening the lead before competitors catch up.`}
              </p>
            </div>

            {/* Per-answer breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {aiVisibility.rows.map((r, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--accent)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {r.model}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        · {r.live ? "live web" : "model knowledge"}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: r.mentioned
                          ? "rgba(110, 231, 183, 0.15)"
                          : "rgba(255, 120, 120, 0.12)",
                        color: r.mentioned ? "#6EE7B7" : "#ff8a8a",
                      }}
                    >
                      {r.mentioned ? `✓ ${brand} mentioned` : `✗ ${brand} not mentioned`}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, marginBottom: 6 }}>
                    “{r.query}”
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.65, margin: 0 }}>
                    {r.answer.length > 360 ? r.answer.slice(0, 360).trim() + "…" : r.answer}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 20, color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
              Live answers from Gemini (Google Search–grounded) and Claude,
              generated when this report loaded. AEOrank tracks these across
              every major AI engine for paying customers.
            </p>
          </div>
        </section>
      )}

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
          <PricingTiers brand={brand} />
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
