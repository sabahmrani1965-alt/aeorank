// Reusable "Steps to grow" marketing section.
// Used on the homepage with SaaSOffers as a showcase example, and on the
// report page personalised to whichever brand the visitor entered.

function asUserHandle(brand) {
  // Build a plausible-looking official-account handle: "Notion" → "Notion_Official"
  const cleaned = String(brand || "Brand").replace(/\s+/g, "");
  return `${cleaned}_Official`;
}

function pickTopic(description, categoryQuery, brand) {
  if (categoryQuery) return categoryQuery;
  if (description) {
    const m = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .find((w) => w.length > 4);
    if (m) return m;
  }
  return `${brand} and our category`;
}

export default function StepsSection({
  brand = "SaaSOffers",
  brandUrl = "https://saasoffers.tech",
  brandHost = "saasoffers.tech",
  description = "",
  categoryQuery = "",
  topSub = "r/SaaS",
  // Showcase mode (homepage) uses a richer, hand-written example;
  // personalised mode uses safer dynamic copy.
  showcase = false,
  // Stat numbers for the AI Visibility card. Defaults are an illustrative
  // showcase; the report page passes its own brand-stable seeded numbers.
  stats = { lift: "+247%", chatgpt: 18, claude: 15, gemini: 11, max: 24 },
}) {
  const topic = pickTopic(description, categoryQuery, brand);
  const handle = asUserHandle(brand);

  // Step-1 mock body: showcase has a polished hand-written example,
  // personalised version uses a generic template that works for any brand.
  const step1Body = showcase ? (
    <>
      Hey r/SaaS — sharing a breakdown of how we approach SaaS costs at{" "}
      <a
        href={brandUrl}
        rel="dofollow"
        target="_blank"
        className="reddit-mock-link"
      >
        {brandHost}
      </a>
      . We've put together a list of credit programs from AWS, Notion, Deel
      and 500+ tools, and figured the breakdown might be useful here. Happy
      to answer questions in the comments.
    </>
  ) : (
    <>
      Hey {topSub} — sharing some context on how we think about {topic} at{" "}
      {brand}.{" "}
      {description ? description.slice(0, 110) : `Quick intro to what we've been working on.`}
      {" "}More on our site:{" "}
      <a
        href={brandUrl}
        rel="dofollow"
        target="_blank"
        className="reddit-mock-link"
      >
        {brandHost}
      </a>
      . Happy to answer questions below.
    </>
  );

  const step1Title = showcase
    ? `How we cut our startup's SaaS bill by 40% (and the tools that helped)`
    : `How we approach ${topic} at ${brand}`;

  return (
    <section className="section section-alt">
      <div className="container">
        <span className="section-tag">( steps to grow )</span>
        <h2>
          Boost <span className="accent">{brand}</span>'s Visibility Through
          <br />
          Strategic Reddit Engagement
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
              We write strategic Reddit posts and comments for {brand}:
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
              <div className="reddit-mock-meta">
                {topSub} · Posted by u/{handle} · 3 days ago
              </div>
              <div className="reddit-mock-title">{step1Title}</div>
              <div className="reddit-mock-body">{step1Body}</div>
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
                  {stats.lift}
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 13 }}>
                  {brand} mentions in AI answers vs. baseline
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "ChatGPT", count: stats.chatgpt },
                  { label: "Claude", count: stats.claude },
                  { label: "Gemini", count: stats.gemini },
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
                        width: `${Math.min(100, (row.count / stats.max) * 100)}%`,
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
              We grow real engagement and measure what AI is saying:
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
  );
}
