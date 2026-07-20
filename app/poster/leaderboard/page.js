import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateForType, xpForEarnings, levelForXp } from "@/lib/posterPay";
import EmptyState from "@/components/karmacrew/EmptyState";

export const dynamic = "force-dynamic";

export default async function PosterLeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  let ranked = [];
  if (admin) {
    const [{ data: posters }, { data: tasks }] = await Promise.all([
      admin.from("users").select("id, email").eq("role", "poster"),
      admin.from("report_drafts").select("claimed_by, type").eq("status", "submitted"),
    ]);

    const earningsByPoster = new Map();
    for (const t of tasks || []) {
      if (!t.claimed_by) continue;
      earningsByPoster.set(t.claimed_by, (earningsByPoster.get(t.claimed_by) || 0) + rateForType(t.type));
    }

    ranked = (posters || [])
      .map((p) => {
        const earned = earningsByPoster.get(p.id) || 0;
        const xp = xpForEarnings(earned);
        return { id: p.id, name: (p.email || "").split("@")[0], earned, xp, level: levelForXp(xp) };
      })
      .sort((a, b) => b.earned - a.earned)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }

  const top = ranked.slice(0, 20);
  const you = ranked.find((p) => p.id === user.id);
  const youInTop = top.some((p) => p.id === user.id);

  return (
    <section>
      <span className="section-tag">( leaderboard )</span>
      <h2>Top posters</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Ranked by lifetime earnings across all completed tasks.
      </p>

      {top.length === 0 ? (
        <EmptyState icon="🏆" title="No completed tasks yet." subtitle="Be the first one on the board." actionHref="/poster" actionLabel="Go to Play →" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {top.map((p) => (
            <LeaderboardRow key={p.id} entry={p} isYou={p.id === user.id} />
          ))}
          {!youInTop && you && (
            <>
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12.5, padding: "6px 0" }}>···</div>
              <LeaderboardRow entry={you} isYou />
            </>
          )}
        </div>
      )}
    </section>
  );
}

function LeaderboardRow({ entry, isYou }) {
  const rankClass = entry.rank <= 3 ? ` kc-rank-${entry.rank}` : "";
  return (
    <div className={`kc-leaderboard-row${isYou ? " is-you" : ""}`}>
      <span className={`kc-leaderboard-rank${rankClass}`}>#{entry.rank}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {entry.name}
          {isYou && <span style={{ color: "var(--accent)", fontWeight: 600 }}> (you)</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Level {entry.level} · {entry.xp} XP</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>${entry.earned.toFixed(2)}</div>
    </div>
  );
}
