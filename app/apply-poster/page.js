import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CrewQuestHeader from "@/components/CrewQuestHeader";
import SignupForm from "@/components/SignupForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Become a creator: CrewQuest",
  description: "Sign up to become a CrewQuest creator and get paid for real Reddit missions.",
};

export default async function ApplyPosterPage({ searchParams }) {
  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";
  const redirectTo = `/apply-poster/verify${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;

  // A visitor can land here already authenticated — most commonly a
  // brand-new Google OAuth signup from /login on the CrewQuest domain,
  // which middleware.js routes /onboarding -> here (see its comment on
  // AEORANK_ONLY/CREWQUEST_ONLY). Showing the email/password signup form
  // again in that case is confusing (they just connected Google, with
  // nothing telling them it worked) and redundant, so skip straight to
  // the real next step instead, same as app/apply-poster/verify/page.js
  // already does for its own auth check.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

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
            <SignupForm redirectTo={redirectTo} intent="crewquest" />
          </div>
        </div>
      </section>
      <footer style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "40px 24px" }}>
        © {new Date().getFullYear()} CrewQuest.
      </footer>
    </div>
  );
}
