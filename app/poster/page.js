import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PosterDraftCard from "@/components/PosterDraftCard";

export const dynamic = "force-dynamic";

export default async function PosterHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS ("Posters can read assigned drafts") scopes this to only rows
  // assigned to this poster — no explicit .eq needed, but added anyway as
  // belt-and-suspenders, same convention used throughout this app.
  const { data: drafts } = await supabase
    .from("report_drafts")
    .select("id, user_id, subreddit, title, body, posted, permalink, created_at")
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false });

  // Company name for context — the poster doesn't own these company_profiles
  // rows, so RLS would block a direct read; the admin client is used only
  // for this lookup, scoped to owners of drafts already legitimately
  // assigned to this poster.
  const admin = createAdminClient();
  const ownerIds = [...new Set((drafts || []).map((d) => d.user_id))];
  let nameByOwner = new Map();
  if (admin && ownerIds.length > 0) {
    const { data: profiles } = await admin
      .from("company_profiles")
      .select("user_id, company_name")
      .in("user_id", ownerIds);
    nameByOwner = new Map((profiles || []).map((p) => [p.user_id, p.company_name]));
  }

  const enriched = (drafts || []).map((d) => ({ ...d, companyName: nameByOwner.get(d.user_id) }));
  const toComplete = enriched.filter((d) => !d.posted);
  const completed = enriched.filter((d) => d.posted);

  return (
    <section>
      <span className="section-tag">( poster )</span>
      <h2>Your assignments</h2>
      <p className="section-sub">
        Copy each draft and post it manually from your own Reddit account, then paste the live
        link back here to mark it complete.
      </p>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 14 }}>To complete ({toComplete.length})</h3>
        {toComplete.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Nothing assigned to you right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {toComplete.map((d) => (
              <PosterDraftCard key={d.id} draft={d} />
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <h3 style={{ marginBottom: 14 }}>Completed ({completed.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {completed.map((d) => (
              <PosterDraftCard key={d.id} draft={d} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
