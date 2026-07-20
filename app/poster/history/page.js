import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEarningsSummary } from "@/lib/posterPay";
import StatusBadge from "@/components/karmacrew/StatusBadge";
import EmptyState from "@/components/karmacrew/EmptyState";

export const dynamic = "force-dynamic";

export default async function PosterHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const summary = admin ? await getEarningsSummary(admin, user.id) : { tasks: [] };

  return (
    <section>
      <span className="section-tag">( history )</span>
      <h2>Completed tasks</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Everything you've submitted, most recent first.
      </p>

      {summary.tasks.length === 0 ? (
        <EmptyState
          icon="🗂"
          title="Nothing completed yet."
          subtitle="Pick a task from Play to get your first one in here."
          actionHref="/poster"
          actionLabel="Go to Play →"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {summary.tasks.map((t) => (
            <div key={t.id} className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>r/{t.subreddit}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>
                  {new Date(t.posted_at).toLocaleString()}
                </div>
                {t.permalink && (
                  <a href={t.permalink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: "var(--accent)" }}>
                    View live post ↗
                  </a>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 700 }}>${t.rate.toFixed(2)}</span>
                <StatusBadge status={t.displayStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
