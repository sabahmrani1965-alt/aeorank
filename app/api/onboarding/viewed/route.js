import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Hit via navigator.sendBeacon from app/onboarding/page.js, not a normal
// fetch — a beacon is queued by the browser and still delivered even if
// the tab closes mid-request, unlike the fetch this replaced, which could
// get abandoned by a fast bounce before it ever completed. sendBeacon
// can't carry custom headers (no Authorization/apikey), so this same-origin
// route exists purely to resolve the caller's session from cookies instead.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  await supabase
    .from("users")
    .update({ onboarding_viewed_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("onboarding_viewed_at", null);

  return NextResponse.json({ ok: true });
}
