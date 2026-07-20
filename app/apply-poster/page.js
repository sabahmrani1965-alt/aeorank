import KarmaCrewHeader from "@/components/KarmaCrewHeader";
import ApplyPosterForm from "@/components/ApplyPosterForm";

export const metadata = {
  title: "Apply to be a poster — KarmaCrew",
  description: "Apply to join KarmaCrew and get paid to post Reddit replies and comments on behalf of brands.",
};

export default function ApplyPosterPage({ searchParams }) {
  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";

  return (
    <div className="kc-theme" style={{ minHeight: "100vh" }}>
      <KarmaCrewHeader />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( apply )</span>
          <h2 style={{ textAlign: "center" }}>
            Become a <span className="accent">KarmaCrew</span> poster
          </h2>
          <p className="section-sub" style={{ marginBottom: 28 }}>
            Get paid to post AI-drafted replies and comments to Reddit on behalf of brands, from
            your own account. Submit your email below and we'll review your application.
          </p>

          <div className="card" style={{ padding: 30 }}>
            <ApplyPosterForm referral={ref} />
          </div>
        </div>
      </section>
      <footer style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "40px 24px" }}>
        © {new Date().getFullYear()} KarmaCrew.
      </footer>
    </div>
  );
}
