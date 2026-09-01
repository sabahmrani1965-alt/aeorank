import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getEarningsSummary, computeStreak } from "@/lib/posterPay";
import { getDailyCount, DAILY_TASK_LIMIT } from "@/lib/posterTasks";
import PosterShell from "@/components/karmacrew/PosterShell";

export const dynamic = "force-dynamic";

export default async function PosterLayout({ children }) {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  // Was "/dashboard" — on the CrewQuest domain, middleware.js unconditionally
  // rewrites /dashboard back to /poster (its AEOrank-side equivalent), so a
  // non-poster hitting this redirected straight into a loop with no way
  // out. /apply-poster is the actual CrewQuest-side destination for
  // "you're signed in but not verified yet" — middleware.js's own
  // non-poster-domain branch already sends it on to /signup instead when
  // this somehow gets hit from the AEOrank side.
  if (profile?.role !== "poster") redirect("/apply-poster");

  const admin = createAdminClient();

  const [summary, dailyCount, { data: notifRows }] = await Promise.all([
    admin ? getEarningsSummary(admin, user.id) : { totalEarned: 0, totalPaid: 0, pending: 0, tasks: [], payouts: [] },
    admin ? getDailyCount(admin, user.id) : 0,
    admin
      ? admin.from("notifications").select("message, created_at").eq("poster_id", user.id).order("created_at", { ascending: false }).limit(5)
      : { data: [] },
  ]);

  const tasksCompleted = summary.tasks.length;
  const streak = computeStreak(summary.tasks.map((t) => t.posted_at));

  // Real notification feed — review decisions (approve/changes
  // requested/reject, from the persisted notifications table — see
  // supabase/schema.sql, needed because a reject wipes the report_drafts
  // row itself) merged with recent submissions + payouts, sorted
  // together. Not a decorative bell with nothing behind it.
  const reviewEvents = (notifRows || []).map((n) => ({ at: n.created_at, text: n.message }));
  const submissionEvents = summary.tasks.slice(0, 5).map((t) => ({
    at: t.posted_at,
    text: `Submitted r/${t.subreddit}: $${t.rate.toFixed(2)} ${t.displayStatus === "paid" ? "(paid)" : "(pending payout)"}`,
  }));
  const payoutEvents = summary.payouts.slice(0, 5).map((p) => ({
    at: p.created_at,
    text: `Payout received: $${Number(p.amount).toFixed(2)}${p.note ? ` - ${p.note}` : ""}`,
  }));
  const notifications = [...reviewEvents, ...submissionEvents, ...payoutEvents]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return (
    <PosterShell
      email={user.email}
      stats={{
        totalEarned: summary.totalEarned,
        pending: summary.pending,
        tasksCompleted,
        streak,
        dailyCount,
        dailyLimit: DAILY_TASK_LIMIT,
      }}
      notifications={notifications}
      discordUrl={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || null}
    >
      {children}
    </PosterShell>
  );
}
