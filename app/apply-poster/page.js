import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplyPosterForm from "@/components/ApplyPosterForm";

export const metadata = {
  title: "Apply to be a poster — AEOrank",
  description: "Apply to become an AEOrank poster and get paid to post Reddit replies on behalf of brands.",
};

export default function ApplyPosterPage({ searchParams }) {
  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";

  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( apply )</span>
          <h2 style={{ textAlign: "center" }}>
            Become an <span className="accent">AEOrank</span> poster
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
      <Footer />
    </>
  );
}
