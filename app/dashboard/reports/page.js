import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardAnalyzeForm from "@/components/DashboardAnalyzeForm";
import AiVisibilityRecheckButton from "@/components/AiVisibilityRecheckButton";
import { getActiveCompanyProfile } from "@/lib/brands";

export const dynamic = "force-dynamic";

function scoreCls(score) {
  if (score == null) return "is-none";
  if (score >= 50) return "is-good";
  if (score > 0) return "is-mid";
  return "is-bad";
}

export default async function DashboardReportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getActiveCompanyProfile(supabase, user.id);

  const { data: reports } = profile
    ? await supabase
        .from("reports")
        .select("id, brand, url, score, total, hits, created_at")
        .eq("user_id", user.id)
        .eq("company_profile_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="dashboard-page">
      <div className="op-head">
        <div>
          <h1 className="command-greeting">Reports</h1>
          <p className="command-greeting-sub" style={{ marginBottom: 0 }}>
            One-off AI visibility checks: we ask the engines your buyers&rsquo; questions and record whether each answer names the brand.
          </p>
        </div>
      </div>

      <div className="dx-row">
        <section className="dx-panel rp-action">
          <div className="dx-panel-head">
            <h2>Re-check {profile?.company_name || "your brand"}</h2>
          </div>
          <p className="dx-muted">Runs a fresh check on your own brand now and saves it as a report. Takes up to a minute.</p>
          <AiVisibilityRecheckButton />
        </section>
        <section className="dx-panel rp-action">
          <div className="dx-panel-head">
            <h2>Analyze another website</h2>
          </div>
          <p className="dx-muted">A competitor or a prospect: see whether AI assistants name them.</p>
          <DashboardAnalyzeForm />
        </section>
      </div>

      <section className="dx-panel">
        <div className="dx-panel-head">
          <h2>
            Saved reports <span className="op-tab-n">{reports?.length || 0}</span>
          </h2>
        </div>
        {!reports || reports.length === 0 ? (
          <p className="dx-muted">No reports yet. Re-check your brand or analyze a website above.</p>
        ) : (
          <ul className="rp-list">
            {reports.map((r) => (
              <li key={r.id}>
                <Link href={`/dashboard/reports/${r.id}`} className="rp-row">
                  <span className={`rp-score ${scoreCls(r.score)}`}>{r.score == null ? "–" : `${r.score}%`}</span>
                  <span className="rp-main">
                    <strong>{r.brand}</strong>
                    <span>
                      {r.url ? `${r.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} · ` : ""}
                      {r.total ? `named in ${r.hits ?? 0} of ${r.total} answers` : "no answers recorded"}
                    </span>
                  </span>
                  <span className="rp-date">{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="rp-open" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
