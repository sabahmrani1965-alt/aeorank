import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PosterSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section>
      <span className="section-tag">( settings )</span>
      <h2>Settings</h2>

      <div className="card" style={{ padding: 22, maxWidth: 480, marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 4 }}>Email</div>
          <div style={{ fontWeight: 600 }}>{user.email}</div>
        </div>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>Password</div>
          <Link href="/forgot-password" className="btn btn-ghost btn-sm">
            Change password →
          </Link>
        </div>
      </div>
    </section>
  );
}
