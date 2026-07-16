import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardAnalyzeForm from "@/components/DashboardAnalyzeForm";
import AiVisibilityRecheckButton from "@/components/AiVisibilityRecheckButton";
import { CREDIT_COSTS } from "@/lib/credits";

export const dynamic = "force-dynamic";

export default async function DashboardReportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, brand, url, score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( report history )</span>
        <h2>Your reports</h2>
        <p className="section-sub">
          Every AI-visibility report generated while you were logged in.
        </p>

        <DashboardAnalyzeForm />

        <div style={{ margin: "20px 0" }}>
          <AiVisibilityRecheckButton cost={CREDIT_COSTS.ai_visibility_report} />
        </div>

        {!reports || reports.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No reports yet — analyze a website above to generate your first one.
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
      </div>
    </section>
  );
}
