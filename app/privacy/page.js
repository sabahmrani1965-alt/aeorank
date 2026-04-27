import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — AEOrank",
};

export default function Privacy() {
  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <h2 style={{ textAlign: "left", marginBottom: 8 }}>Privacy Policy</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Last updated: {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>What we collect</h3>
            <p style={{ color: "var(--text-dim)" }}>
              When you submit the contact form, we collect the name, email,
              company, and message you provide. When you generate a free
              report, we receive the URL you entered. We do not use cookies
              for tracking or advertising.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>How we use it</h3>
            <p style={{ color: "var(--text-dim)" }}>
              Contact-form submissions are used solely to reply to you about
              your inquiry. URLs you submit are used to fetch public
              information from your site and from Reddit's public API in
              order to generate your report.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Third-party services</h3>
            <p style={{ color: "var(--text-dim)" }}>
              We query Reddit's public read-only JSON endpoints to surface
              community and post data. We do not share your contact details
              with third parties without your consent.
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Your rights</h3>
            <p style={{ color: "var(--text-dim)" }}>
              You can request a copy or deletion of any personal data we
              hold about you by emailing us via the{" "}
              <a href="/contact" style={{ color: "var(--accent)" }}>contact page</a>.
              We respond within 30 days.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
