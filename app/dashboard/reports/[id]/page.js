import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AiVisibilityScoreCard from "@/components/AiVisibilityScoreCard";

export const dynamic = "force-dynamic";

export default async function DashboardReportDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: report } = await supabase
    .from("reports")
    .select("id, brand, url, score, total, hits, competitors, rows, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!report) notFound();

  const aiVisibility = {
    score: report.score,
    total: report.total,
    hits: report.hits,
    competitors: report.competitors || [],
    rows: report.rows || [],
  };

  return (
    <>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <span className="section-tag">
            ( saved {new Date(report.created_at).toLocaleDateString()} )
          </span>
          <h2>{report.brand}</h2>
          {report.url && (
            <p className="section-sub">
              <a href={report.url} target="_blank" rel="noopener noreferrer">
                {report.url}
              </a>
            </p>
          )}
        </div>
      </section>
      <AiVisibilityScoreCard brand={report.brand} aiVisibility={aiVisibility} />
    </>
  );
}
