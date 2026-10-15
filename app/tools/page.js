import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import { TOOLS } from "@/components/tools/ToolPage";

const URL = "https://www.aeorank.tech/tools";

export const metadata = {
  title: "Free Reddit Tools | AEOrank",
  description: "Free Reddit tools: a markdown formatter with live preview, a post title checker and a self-promotion checker. No sign-up, nothing stored.",
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
            Small tools for writing on Reddit. No sign-up, and everything runs in your browser.
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
