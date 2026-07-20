import CrewQuestHeader from "@/components/CrewQuestHeader";
import JoinTabs from "@/components/JoinTabs";

export const metadata = {
  title: "Join CrewQuest",
  description:
    "Apply to become a CrewQuest creator and get paid for real Reddit missions, or sign up as a brand to launch missions.",
};

export default function ApplyPosterPage({ searchParams }) {
  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";
  const initialTab = searchParams?.as === "brand" ? "brand" : "creator";

  return (
    <div className="kc-theme" style={{ minHeight: "100vh" }}>
      <CrewQuestHeader />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( join )</span>
          <h2 style={{ textAlign: "center" }}>
            Join <span className="accent">CrewQuest</span>
          </h2>
          <p className="section-sub" style={{ marginBottom: 28 }}>
            Complete missions and get paid, or launch missions for your brand.
          </p>

          <JoinTabs referral={ref} initialTab={initialTab} />
        </div>
      </section>
      <footer style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "40px 24px" }}>
        © {new Date().getFullYear()} CrewQuest.
      </footer>
    </div>
  );
}
