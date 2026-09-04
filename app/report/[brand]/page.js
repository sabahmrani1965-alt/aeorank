import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KeywordChart from "@/components/KeywordChart";
import PricingTiers from "@/components/PricingTiers";
import StepsSection from "@/components/StepsSection";
import AiVisibilityScoreCard from "@/components/AiVisibilityScoreCard";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyProfile } from "@/lib/brands";
import { prettyBrand, extractBrandFromTitle } from "@/lib/site";
import { fetchSiteMeta } from "@/lib/siteFetch";
import {
  heuristicKeywords,
  enrichKeywordsWithVolumes,
  totalsFromKeywords,
  pickCategoryQuery,
} from "@/lib/keywords";
import { searchSubreddits, searchPosts, timeAgo } from "@/lib/reddit";
import { generateKeywordsFromLlm, suggestRedditPost, isLlmConfigured, filterCommentablePosts } from "@/lib/llm";
import { analyzeBrandVisibility, isAiVisibilityConfigured } from "@/lib/aivisibility";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const brand = prettyBrand(params.brand);
  return {
    title: `${brand} - Reddit & AI Visibility Report | AEOrank`,
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
  //
  // ?category= override: the auto-derived query comes from the site's own
  // meta description, and ambiguous wording there can point the whole
  // report at the wrong industry (real case: a payments company describing
  // itself with "A2A" — account-to-account — got matched to agent-to-agent
  // AI subreddits). Used when we hand-craft a report link for outreach.
  const categoryOverride = String(searchParams?.category || "").trim().slice(0, 60);
  const categoryQuery = categoryOverride || pickCategoryQuery(description, brand);
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
        : Promise.resolve({ score: null, total: 0, hits: 0, rows: [], competitors: [] }),
    ]);

  const postsAreOpportunities = !brandPosts || brandPosts.length === 0;
  const postsRaw = postsAreOpportunities ? opportunityPosts : brandPosts;

  // Build the keyword rows: prefer Claude phrases, fall back to heuristics.
  const keywordPhrases = llmKeywords && llmKeywords.length >= 5
    ? llmKeywords
    : heuristicKeywords(brand, description, 20);
  const keywords = enrichKeywordsWithVolumes(brand, keywordPhrases);
  const totals = totalsFromKeywords(keywords);

  const dedupedPosts = [...new Map(postsRaw.map((p) => [p.permalink, p])).values()]
    .sort((a, b) => b.ups - a.ups)
    .slice(0, 10);

  // Every thread shown must be one where a comment mentioning the brand
  // would genuinely fit — Claude vets each candidate and off-topic ones
  // are dropped (see filterCommentablePosts). Fails soft: if the filter
  // itself can't run, the unfiltered list renders as before rather than
  // blanking the section on an infra hiccup.
  const commentable = llmEnabled
    ? await filterCommentablePosts(brand, description, dedupedPosts)
    : null;
  const posts = commentable ?? dedupedPosts;

  // Draft a single post suggestion for the top real subreddit we found.
  // This is copy-and-post guidance for the customer's own account — nothing
  // here calls Reddit's API or publishes anything automatically.
  const topSubForDraft = subreddits[0]?.name || null;
  const suggestedPost = llmEnabled && topSubForDraft
    ? await suggestRedditPost(brand, description, categoryQuery, topSubForDraft)
    : null;

  // Persist this report for logged-in users only — anonymous visitors keep
  // today's exact behavior (nothing written anywhere). Failures here must
  // never break the report render, so this is fully fail-soft.
  let draftId = null;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await getActiveCompanyProfile(supabase, user.id);
      const { data: report } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          company_profile_id: profile?.id || null,
          brand,
          url: enteredUrl || null,
          score: aiVisibility.score,
          total: aiVisibility.total,
          hits: aiVisibility.hits,
          competitors: aiVisibility.competitors || [],
          rows: aiVisibility.rows,
        })
        .select("id")
        .single();

      if (report && suggestedPost) {
        const { data: draft } = await supabase
          .from("report_drafts")
          .insert({
            user_id: user.id,
            company_profile_id: profile?.id || null,
            report_id: report.id,
            subreddit: suggestedPost.subreddit,
            title: suggestedPost.title,
            body: suggestedPost.body,
          })
          .select("id")
          .single();
        draftId = draft?.id || null;
      }
    }
  } catch (e) {
    console.error("[report] persistence failed:", e?.message || e);
  }

  return (
    <div className="light-theme">
      <Header />

      {/* Hero */}
      <section className="report-hero">
        <div className="container">
          <div className="hero-pill" style={{ marginBottom: 16 }}>
            <span className="dot" /> Live report: generated {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
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
                , a site described as “
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

      {/* The former "Top Subreddit Opportunities" section was removed —
          subreddit search results were too noisy for a prospect-facing
          page (searchSubreddits is still fetched above: the suggested-
          post draft uses its top result). */}

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
                No one's mentioning <strong>{brand}</strong> on Reddit yet. That's the gap. These are popular threads in your category right now: prime targets to <strong>reply with value</strong>, or to inspire <strong>posts of your own</strong> that own the same topic.
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
      <AiVisibilityScoreCard brand={brand} aiVisibility={aiVisibility} />

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
        suggestedPost={suggestedPost}
        draftId={draftId}
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
    </div>
  );
}
