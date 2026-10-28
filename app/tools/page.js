import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import { TOOLS } from "@/components/tools/ToolPage";

const URL = "https://www.aeorank.tech/tools";

export const metadata = {
  title: "Free Reddit Tools | AEOrank",
  description: "Free Reddit tools: subreddit finder, best time to post, brand mention checker, subreddit rules checker, markdown formatter, title and self-promotion checkers. No sign-up.",
  alternates: { canonical: URL },
  openGraph: { title: "Free Reddit Tools", type: "website", url: URL, images: ["/opengraph-image"] },
};

export default function ToolsHub() {
  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( free tools )</span>
          <h1 style={{ textAlign: "center" }}>
            Free <span className="accent">Reddit tools</span>
          </h1>
          <p className="section-sub">
            Tools for finding the right subreddits, posting at the right time and writing posts that stay up. Free, no sign-up.
          </p>
          <div className="tool-grid">
            {TOOLS.map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="card tool-card">
                <strong>{t.name}</strong>
                <span>{t.blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
