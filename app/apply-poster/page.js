import CrewQuestHeader from "@/components/CrewQuestHeader";
import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Become a creator: CrewQuest",
  description: "Sign up to become a CrewQuest creator and get paid for real Reddit missions.",
};

export default function ApplyPosterPage({ searchParams }) {
  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";
  const redirectTo = `/apply-poster/verify${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;

  return (
    <div className="kc-theme" style={{ minHeight: "100vh" }}>
      <CrewQuestHeader />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( become a creator )</span>
          <h2 style={{ textAlign: "center" }}>
            Join <span className="accent">CrewQuest</span>
          </h2>
          <p className="section-sub" style={{ marginBottom: 28 }}>
            Create your account, we'll check your Reddit account right after.
          </p>

          <div className="card" style={{ padding: 30, maxWidth: 420, margin: "0 auto" }}>
            <SignupForm redirectTo={redirectTo} />
          </div>
        </div>
      </section>
      <footer style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "40px 24px" }}>
        © {new Date().getFullYear()} CrewQuest.
      </footer>
    </div>
  );
}
