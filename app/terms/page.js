import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — AEOrank",
};

export default function Terms() {
  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <h2 style={{ textAlign: "left", marginBottom: 8 }}>Terms of Service</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Last updated: {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Service description</h3>
            <p style={{ color: "var(--text-dim)" }}>
              AEOrank provides Reddit-engagement and AI-visibility services
              under written agreement. The free report tool on this site is a
              non-binding overview based on public Reddit data and your site's
              public metadata.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>No guarantees on AI outputs</h3>
            <p style={{ color: "var(--text-dim)" }}>
              We do not control how third-party AI systems (ChatGPT, Claude,
              Gemini, etc.) generate their responses. We do not guarantee that
              your brand will be cited in any specific model output. We
              measure and report directional signals.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Acceptable use</h3>
            <p style={{ color: "var(--text-dim)" }}>
              You agree not to use AEOrank to defame third parties, spam
              communities that prohibit commercial content, manipulate votes,
              or violate Reddit's User Agreement. We reserve the right to
              decline engagements that conflict with these standards.
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Liability</h3>
            <p style={{ color: "var(--text-dim)" }}>
              The free report is provided "as is" without warranty. Liability
              under any paid engagement is governed by your service agreement
              and capped at fees paid in the prior three months.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
