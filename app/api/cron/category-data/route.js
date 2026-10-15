import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAdminToken } from "@/lib/adminToken";
import { collectDay, rebuildSummaries, DATA_CATEGORIES } from "@/lib/categoryData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 280;

// Daily: ask the fixed category questions, store the answers, rebuild the
// summaries the /ai-recommendations pages read. Vercel Cron sends
// CRON_SECRET; the owner token allows a manual run.
export async function GET(req) {
  const deadline = Date.now() + 250000;
  const cron = process.env.CRON_SECRET && req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  if (!cron && !hasAdminToken(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const collected = await collectDay({ deadline });
  const summaries = await rebuildSummaries();
  revalidatePath("/ai-recommendations");
  for (const c of DATA_CATEGORIES) revalidatePath(`/ai-recommendations/${c.slug}`);
  return NextResponse.json({ ...collected, summaries });
}
