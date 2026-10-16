import Link from "next/link";
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
      <section className="dashboard-page" style={{ paddingBottom: 0 }}>
        <Link href="/dashboard/reports" className="dx-link">
          ← All reports
        </Link>
        <div className="op-head" style={{ marginTop: 10, marginBottom: 0 }}>
          <div>
            <h1 className="command-greeting">{report.brand}</h1>
            <p className="command-greeting-sub" style={{ marginBottom: 0 }}>
              Checked {new Date(report.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {report.url ? (
                <>
                  {" · "}
                  <a href={report.url} target="_blank" rel="noopener noreferrer" className="dx-link">
                    {report.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>
      <AiVisibilityScoreCard brand={report.brand} aiVisibility={aiVisibility} />
    </>
  );
}
