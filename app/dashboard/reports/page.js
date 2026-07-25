import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardAnalyzeForm from "@/components/DashboardAnalyzeForm";
import AiVisibilityRecheckButton from "@/components/AiVisibilityRecheckButton";
import { getActiveCompanyProfile } from "@/lib/brands";

export const dynamic = "force-dynamic";

export default async function DashboardReportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const { data: reports } = profile
    ? await supabase
        .from("reports")
        .select("id, brand, url, score, created_at")
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="dashboard-page">
      <div className="app-sidebar-group-label" style={{ padding: 0, marginBottom: 6 }}>Analyze</div>
      <h2 style={{ marginBottom: 8 }}>Your reports</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Every AI-visibility report generated while you were logged in.
      </p>

      <DashboardAnalyzeForm />

      <div style={{ margin: "20px 0" }}>
        <AiVisibilityRecheckButton />
      </div>

      {!reports || reports.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
          No reports yet. Analyze a website above to generate your first one.
        </div>
      ) : (
        <div className="post-grid">
          {reports.map((r) => (
            <Link key={r.id} href={`/dashboard/reports/${r.id}`} className="post-card">
              <div className="post-meta">
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="post-title">{r.brand}</div>
              <div className="post-snippet">
                {r.score == null ? "No AI visibility score" : `${r.score}% AI visibility score`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
