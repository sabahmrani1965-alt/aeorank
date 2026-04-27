import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About — AEOrank",
  description:
    "AEOrank helps brands appear in AI chat answers through measurable Reddit engagement.",
};

export default function About() {
  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( about )</span>
          <h2 style={{ textAlign: "center" }}>
            Built for the new <span className="accent">answer engine</span> era
          </h2>
          <p className="section-sub">
            Search is changing. People ask ChatGPT, Claude, and Gemini the
            questions they used to type into Google. AEOrank helps brands show
            up in those answers.
          </p>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>What we do</h3>
            <p style={{ color: "var(--text-dim)" }}>
              We map the Reddit communities where your audience already
              discusses the problems your product solves. Then we help you
              participate in those discussions strategically — with content
              that's reviewed by you, in subreddits that allow it, and
              measured against an AI-visibility baseline.
            </p>
            <p style={{ color: "var(--text-dim)", marginTop: 12 }}>
              Reddit isn't the whole answer-engine puzzle, but it's a major
              training-data source for every leading LLM. Showing up there
              measurably moves how AI talks about you.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>How it works</h3>
            <ol style={{ color: "var(--text-dim)", paddingLeft: 22, lineHeight: 1.8 }}>
              <li><strong>Free report</strong> — enter your URL, get an instant scan of relevant subreddits, posts, and keyword angles.</li>
              <li><strong>Onboarding call</strong> — we align on tone, target communities, and goals.</li>
              <li><strong>Content + engagement</strong> — every comment or post is drafted, reviewed by you, and only published if you approve.</li>
              <li><strong>Reporting</strong> — weekly visibility reports plus an AI-visibility score tracking branded references in LLM outputs.</li>
            </ol>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>What we won't do</h3>
            <ul style={{ color: "var(--text-dim)", paddingLeft: 22, lineHeight: 1.8 }}>
              <li>We don't run vote rings or operate fake accounts.</li>
              <li>We don't post in subreddits that disallow commercial content.</li>
              <li>We don't promise specific LLM citations — nobody can.</li>
              <li>We disclose affiliations whenever a community requires it.</li>
            </ul>
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/contact" className="btn btn-primary btn-large">
              Talk to us →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
