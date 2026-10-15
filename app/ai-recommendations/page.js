import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import { DATA_CATEGORIES, loadIndex } from "@/lib/categoryData";

export const revalidate = 3600;

const SITE_URL = "https://www.aeorank.tech";

export const metadata = {
  title: "Which brands do AI assistants recommend? Daily data by category",
  description:
    "Every day we ask ChatGPT, Claude and Gemini the same buyer questions across software categories and publish which brands they name.",
  alternates: { canonical: `${SITE_URL}/ai-recommendations` },
  openGraph: {
    title: "Which brands do AI assistants recommend?",
    description: "Daily data on the brands ChatGPT, Claude and Gemini name, by software category.",
    type: "website",
    url: `${SITE_URL}/ai-recommendations`,
    images: ["/opengraph-image"],
  },
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function AiRecommendations() {
  const index = await loadIndex();
  const bySlug = new Map((index?.categories || []).map((c) => [c.slug, c]));

  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( daily AI answer data )</span>
          <h1>
            Which brands do <span className="accent">AI assistants recommend?</span>
          </h1>
          <p className="section-sub">
            Every day we ask ChatGPT, Claude and Gemini the same buyer questions in each category below and count which
            brands their answers name. Pick a category to see the full table and the answers themselves.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow" style={{ display: "grid", gap: 14 }}>
          {DATA_CATEGORIES.map((cat) => {
            const s = bySlug.get(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/ai-recommendations/${cat.slug}`}
                className="card"
                style={{ padding: 22, display: "block", textDecoration: "none" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <h2 style={{ fontSize: 20, margin: 0, color: "var(--text)" }}>{cap(cat.name)}</h2>
                  <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    {s ? `${s.totalAnswers} answers, ${s.days} ${s.days === 1 ? "day" : "days"}` : "Collecting"}
                  </span>
                </div>
                <p style={{ color: "var(--text-dim)", margin: "8px 0 0", lineHeight: 1.6 }}>
                  {s?.top?.length
                    ? `Most named: ${s.top.map((b) => `${b.name} (${b.share}%)`).join(", ")}`
                    : "First results appear after the next daily run."}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>Why we publish this</h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            AEOrank tracks whether AI assistants name a brand. This is the same measurement, run on whole categories
            with our own fixed questions, so anyone can see who the assistants favour today. We publish{" "}
            <Link href="/proof" style={{ color: "var(--accent)" }}>
              our own score
            </Link>{" "}
            the same way.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link href="/free-ai-visibility-checker" className="btn btn-primary">
              Check your brand free →
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
