import Link from "next/link";
import MarketingLayout from "@/components/MarketingLayout";
import FreeVisibilityChecker from "@/components/tools/FreeVisibilityChecker";

const URL = "https://www.aeorank.tech/free-ai-visibility-checker";
const TITLE = "Free AI Visibility Checker";
const DESCRIPTION =
  "Free AI visibility checker: see whether ChatGPT, Claude, Gemini and Perplexity name your brand when buyers ask about your category, and who they name instead.";

export const metadata = {
  title: `${TITLE}: Does ChatGPT Mention Your Brand? | AEOrank`,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: URL, images: ["/opengraph-image"] },
};

const FAQ = [
  {
    q: "How does the checker work?",
    a: "It reads your homepage to work out your category, asks the AI engines a few questions a buyer in that category would ask, and checks each answer for your brand name. It also lists the other brands the answers named.",
  },
  {
    q: "Which AI engines does it check?",
    a: "Claude and Gemini, plus ChatGPT and Perplexity when they are reachable. The result shows which engines answered.",
  },
  {
    q: "Why only one check per day?",
    a: "Every check asks several AI engines in real time, which costs money to run. One free check per day keeps it free for everyone.",
  },
  {
    q: "Is one check reliable?",
    a: "It is a snapshot. AI answers change from day to day and with wording, so treat it as a first look. Tracking the same questions over time is what shows a trend.",
  },
];

export default function Page() {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: TITLE,
    url: URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": "https://www.aeorank.tech/#organization" },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <MarketingLayout>
      {[appLd, faqLd].map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container-narrow">
          <span className="section-tag">( free tool )</span>
          <h1 style={{ textAlign: "center" }}>
            Does ChatGPT <span className="accent">mention your brand?</span>
          </h1>
          <p className="section-sub">
            Enter your website. We ask ChatGPT, Claude, Gemini and Perplexity what a buyer in your
            category would ask, and show whether they name you, and who they name instead.
          </p>
          <FreeVisibilityChecker />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container-narrow tool-guide">
          <h2>What to do with the result</h2>
          <p>
            If the engines don't name you, look at who they name instead. Those brands are usually
            present in the sources the engines lean on: review sites, comparison articles and Reddit
            threads where buyers ask for recommendations. AEOrank's own result is public on{" "}
            <Link href="/proof">our proof page</Link>, including where it is zero.
          </p>
          <p>
            For the reasons behind a result, see <Link href="/blog/how-to-get-cited-by-chatgpt">how to get cited by ChatGPT</Link>{" "}
            and <Link href="/blog/why-chatgpt-cites-reddit-threads">why ChatGPT cites Reddit threads</Link>.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-narrow">
          <h2 style={{ textAlign: "center" }}>Questions</h2>
          {FAQ.map((f) => (
            <details key={f.q} className="card" style={{ marginBottom: 10 }}>
              <summary style={{ fontWeight: 600, cursor: "pointer" }}>{f.q}</summary>
              <p style={{ color: "var(--text-dim)", marginTop: 10 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
