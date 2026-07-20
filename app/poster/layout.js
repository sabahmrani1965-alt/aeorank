import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import PosterHeader from "@/components/PosterHeader";

export default async function PosterLayout({ children }) {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "poster") redirect("/dashboard");

  return (
    <div className="kc-theme" style={{ minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <PosterHeader email={user.email} />
        {children}
      </div>
    </div>
  );
}
