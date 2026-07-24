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
  if (profile?.role !== "poster") redirect("/dashboard");

  const admin = createAdminClient();

  const [summary, dailyCount] = await Promise.all([
    admin ? getEarningsSummary(admin, user.id) : { totalEarned: 0, totalPaid: 0, pending: 0, tasks: [], payouts: [] },
    admin ? getDailyCount(admin, user.id) : 0,
  ]);

  const tasksCompleted = summary.tasks.length;
  const streak = computeStreak(summary.tasks.map((t) => t.posted_at));

  // Real notification feed — recent submissions + recent payouts, merged
  // and sorted, not a decorative bell with nothing behind it.
  const submissionEvents = summary.tasks.slice(0, 5).map((t) => ({
    at: t.posted_at,
    text: `Submitted r/${t.subreddit}: $${t.rate.toFixed(2)} ${t.displayStatus === "paid" ? "(paid)" : "(pending payout)"}`,
  }));
  const payoutEvents = summary.payouts.slice(0, 5).map((p) => ({
    at: p.created_at,
    text: `Payout received: $${Number(p.amount).toFixed(2)}${p.note ? ` - ${p.note}` : ""}`,
  }));
  const notifications = [...submissionEvents, ...payoutEvents]
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
