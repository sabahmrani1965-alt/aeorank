import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listBrands } from "@/lib/brands";

export const runtime = "nodejs";

// Deletes a brand — blocks deleting the last remaining one (a user should
// always have at least one). The FK's ON DELETE CASCADE cleans up that
// brand's opportunities/mentions/prompts/reports/tasks; if it was the
// active brand, users.active_company_profile_id's ON DELETE SET NULL
// clears the pointer and the next getActiveCompanyProfile() call falls
// back to the next-oldest remaining brand.
export async function DELETE(req, { params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const existing = await listBrands(supabase, user.id);
  if (existing.length <= 1) {
    return NextResponse.json({ error: "You can't delete your only brand." }, { status: 400 });
  }
  if (!existing.some((b) => b.id === params.id)) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("company_profiles")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[brands] delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete this brand." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
