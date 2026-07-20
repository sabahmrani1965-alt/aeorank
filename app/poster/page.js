import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getActiveClaim,
  getCooldowns,
  getDailyCount,
  DAILY_TASK_LIMIT,
  CLAIM_WINDOW_MINUTES,
  estimateMinutes,
  difficultyForBody,
} from "@/lib/posterTasks";
import { rateForType } from "@/lib/posterPay";
import TaskCard from "@/components/karmacrew/TaskCard";
import EmptyState from "@/components/karmacrew/EmptyState";

export const dynamic = "force-dynamic";

export default async function PosterPlayPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  if (!admin) {
    return <EmptyState icon="⚠️" title="Not configured." subtitle="The service role key isn't set up." />;
  }

  // One active claim at a time — send them straight to it instead of
  // letting them browse for more while something's already in progress.
  const activeClaim = await getActiveClaim(admin, user.id);
  if (activeClaim) redirect(`/poster/task/${activeClaim.id}`);

  const dailyCount = await getDailyCount(admin, user.id);
  const dailyLimitReached = dailyCount >= DAILY_TASK_LIMIT;
  const cooldowns = dailyLimitReached ? {} : await getCooldowns(admin, user.id);

  // Real inventory grouping — "slots" reflects genuinely how many rows
  // share the same (customer, subreddit, type) combo, not a fabricated
  // quota. Widened to a 14-day window so slot totals include recently
  // claimed/submitted siblings, not just what's available right now.
  const since = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
  const { data: recent } = await admin
    .from("report_drafts")
    .select("id, user_id, subreddit, type, title, body, status, created_at")
    .in("status", ["available", "claimed", "submitted"])
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const rows = recent || [];
  const groupKey = (r) => `${r.user_id}::${r.subreddit}::${r.type || "comment"}`;
  const totals = new Map();
  const remaining = new Map();
  for (const r of rows) {
    const k = groupKey(r);
    totals.set(k, (totals.get(k) || 0) + 1);
    if (r.status === "available") remaining.set(k, (remaining.get(k) || 0) + 1);
  }

  const tasks = rows
    .filter((r) => r.status === "available")
    .map((r) => {
      const k = groupKey(r);
      const type = r.type || "comment";
      return {
        id: r.id,
        subreddit: r.subreddit,
        type,
        title: r.title,
        body: r.body,
        reward: rateForType(type),
        estimatedMinutes: estimateMinutes(type),
        difficulty: difficultyForBody(r.body),
        slotsTotal: totals.get(k) || 1,
        slotsRemaining: remaining.get(k) || 1,
      };
    });

  return (
    <section>
      <span className="section-tag">( tasks open )</span>
      <h2>Pick a task</h2>
      <p className="section-sub" style={{ marginBottom: 28 }}>
        Grab one anytime. You get {CLAIM_WINDOW_MINUTES} minutes to post and submit the link. Finishing a task
        briefly cools that task type down — other types stay open.
      </p>

      {tasks.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No tasks available right now."
          subtitle="Check back soon or invite friends while you wait."
          actionHref="/poster/refer"
          actionLabel="Refer a friend →"
        />
      ) : (
        <div className="kc-task-grid">
          {tasks.map((task) => {
            let disabledReason = null;
            if (dailyLimitReached) disabledReason = "Daily limit reached";
            else if (cooldowns[task.type]) disabledReason = `${task.type} on cooldown`;
            return <TaskCard key={task.id} task={task} disabledReason={disabledReason} />;
          })}
        </div>
      )}
    </section>
  );
}
