import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getActiveClaim,
  getCooldowns,
  getDailyCount,
  getAvailableMissions,
  DAILY_TASK_LIMIT,
  CLAIM_WINDOW_MINUTES,
} from "@/lib/posterTasks";
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
  const tasks = await getAvailableMissions(admin);

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
