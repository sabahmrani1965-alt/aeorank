import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return NextResponse.json({ isAdmin: isAdminEmail(user?.email) });
}
