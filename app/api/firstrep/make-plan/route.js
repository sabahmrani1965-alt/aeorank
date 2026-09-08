import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/easyrepGuard";

export const runtime = "nodejs";
export const maxDuration = 60;

// FirstRep's 2-week starter plan generator. Same hosting arrangement as
// the other /api/firstrep routes. The client sends the exercise names it
// ships locally (data/swaps.json) and the prompt requires choosing from
// them, so every planned exercise has an info card and swap options.

const CORS = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-easyrep-key",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// The week's structure is decided here, not by the model, so the session
// count always matches what the user asked for and no muscle is trained
// on back-to-back days. Model compliance is checked, never trusted.
function splitFor(days) {
  const FULL = { name: "Full body", focus: "legs, chest, back, shoulders, arms and stomach" };
  const UPPER = { name: "Upper body", focus: "chest, back, shoulders and arms" };
  const LOWER = { name: "Lower body", focus: "legs, glutes and stomach" };
  const PUSH = { name: "Push", focus: "chest, shoulders and back of arms" };
  const PULL = { name: "Pull", focus: "back and front of arms" };
  const LEGS = { name: "Legs", focus: "legs, glutes and calves" };
  if (days <= 3) {
    return Array.from({ length: days }, (_, i) => ({ ...FULL, name: days === 1 ? "Full body" : `Full body ${i + 1}` }));
  }
  if (days === 4) {
    return [UPPER, LOWER, { ...UPPER, name: "Upper body 2" }, { ...LOWER, name: "Lower body 2" }];
  }
  return [PUSH, PULL, LEGS, UPPER, LOWER];
}

function buildSystem(allowedExercises, sessionPlan) {
  return `You build a gentle one-week gym plan for a nervous absolute beginner. Plain language, no jargon, never judgmental, never use em dashes.

Reply ONLY with JSON:
{
  "weeks": [
    { "sessions": [ { "name": string, "exercises": [ { "name": string, "is_machine": boolean, "sets": number, "reps": string, "note": string } ], "tip": string } ] }
  ],
  "quiet_hours_tip": string
}

Rules:
- Exactly 1 week.
- The single week MUST contain EXACTLY ${sessionPlan.length} sessions, in this order, with these
  exact names and focus. Do not add, drop, merge or rename sessions:
${sessionPlan.map((x, i) => `  ${i + 1}. "${x.name}" - train ${x.focus}`).join("\n")}
- Each session: 5 to 6 exercises, 2 sets each, reps like "10-12".
- Every exercise name MUST be chosen exactly from this list: ${allowedExercises.join("; ")}.
- If the user's fears include free weights or doing form wrong, week 1 uses machines only.
- Balance the week across legs, chest, back, shoulders, arms, stomach. No two sessions identical.
- "note" is one short warm sentence of guidance for that exercise, or "".
- "tip" is one short session-level tip (pacing, rest, or courage), plain words.
- "quiet_hours_tip" is one sentence about when gyms are calmest.`;
}

export async function POST(req) {
  const refused = guard(req, CORS);
  if (refused) return refused;

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "Not configured." }, { status: 500, headers: CORS });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers: CORS });
  }

  const fears = Array.isArray(body?.fears) ? body.fears.map(String).slice(0, 10) : [];
  const gymType = String(body?.gym_type || "commercial chain").slice(0, 40);
  const requested = Number(body?.days_per_week);
  const daysPerWeek = Number.isFinite(requested) ? Math.min(5, Math.max(2, Math.round(requested))) : 2;
  const experience = String(body?.experience || "never").slice(0, 40);
  const goal = String(body?.goal || "build the habit").slice(0, 60);
  const allowed = Array.isArray(body?.allowed_exercises)
    ? body.allowed_exercises.map(String).slice(0, 60)
    : [];
  if (allowed.length < 10) {
    return NextResponse.json({ error: "Send allowed_exercises." }, { status: 400, headers: CORS });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8000,
      system: buildSystem(allowed, splitFor(daysPerWeek)),
      messages: [
        {
          role: "user",
          content: `Build the plan. User profile: fears: ${fears.join(", ") || "none given"}. Gym type: ${gymType}. Days per week: ${daysPerWeek}. Experience: ${experience}. Their goal: ${goal} (let this shade exercise choice and the tips, gently).`,
        },
      ],
    });

    const raw = msg?.content?.[0]?.text?.trim() || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Couldn't build the plan, try again." }, { status: 502, headers: CORS });

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Couldn't build the plan, try again." }, { status: 502, headers: CORS });
    }
    if (!Array.isArray(parsed?.weeks) || parsed.weeks.length !== 1) {
      return NextResponse.json({ error: "Couldn't build the plan, try again." }, { status: 502, headers: CORS });
    }

    return NextResponse.json({ plan: parsed }, { headers: CORS });
  } catch (e) {
    console.error("[firstrep/make-plan] failed:", e?.message || e);
    return NextResponse.json({ error: "Couldn't build the plan, try again." }, { status: 502, headers: CORS });
  }
}
