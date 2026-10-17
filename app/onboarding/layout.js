import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// The wizard saves a brand for the logged-in user, so it means nothing to a
// logged-out visitor (it used to render for them, and only robots.txt kept it
// out of search). Same server-side gate as app/dashboard/layout.js.
export const metadata = { robots: { index: false, follow: false } };

export default async function OnboardingLayout({ children }) {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return children;
}
