import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CrewQuestHeader from "@/components/CrewQuestHeader";
import RedditVerifyForm from "@/components/RedditVerifyForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verify your Reddit account: CrewQuest",
};

export default async function ApplyPosterVerifyPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/apply-poster");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "poster") redirect("/poster");

  const ref = typeof searchParams?.ref === "string" ? searchParams.ref : "";

  return (
    <div className="kc-theme" style={{ minHeight: "100vh" }}>
      <CrewQuestHeader />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( almost there )</span>
          <h2 style={{ textAlign: "center" }}>Verify your Reddit account</h2>
          <p className="section-sub" style={{ marginBottom: 28 }}>
            One last step: tell us which Reddit account you'll post from.
          </p>

          <div className="card" style={{ padding: 30, maxWidth: 420, margin: "0 auto" }}>
            <RedditVerifyForm initialRef={ref} />
          </div>
        </div>
      </section>
      <footer style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "40px 24px" }}>
        © {new Date().getFullYear()} CrewQuest.
      </footer>
    </div>
  );
}
