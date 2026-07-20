import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePosterUser, claimTask, getActiveClaim, getCooldowns, getDailyCount, DAILY_TASK_LIMIT } from "@/lib/posterTasks";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  const supabase = createClient();
  const user = await requirePosterUser(supabase);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 500 });

  const existing = await getActiveClaim(admin, user.id);
  if (existing) {
    if (existing.id === params.id) return NextResponse.json({ ok: true, task: existing });
    return NextResponse.json(
      { error: "Finish or let your current task expire before claiming another." },
      { status: 409 }
    );
  }

  const dailyCount = await getDailyCount(admin, user.id);
  if (dailyCount >= DAILY_TASK_LIMIT) {
    return NextResponse.json({ error: `Daily limit reached (${DAILY_TASK_LIMIT}/day). Come back tomorrow.` }, { status: 403 });
  }

  const { data: target } = await admin.from("report_drafts").select("type").eq("id", params.id).maybeSingle();
  if (target) {
    const cooldowns = await getCooldowns(admin, user.id);
    const type = target.type || "comment";
    if (cooldowns[type]) {
      return NextResponse.json(
        { error: `${type} is on cooldown until ${cooldowns[type].toLocaleTimeString()}. Try a different type.` },
        { status: 409 }
      );
    }
  }

  const claimed = await claimTask(admin, params.id, user.id);
  if (!claimed) {
    return NextResponse.json({ error: "Someone else just grabbed this task. Pick another." }, { status: 409 });
  }

  return NextResponse.json({ ok: true, task: claimed });
}
