import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Defense in depth on top of middleware.js — never renders dashboard
// content for a logged-out visitor even if the middleware matcher drifts.
export default async function DashboardLayout({ children }) {
  // No Supabase project configured yet — redirect home instead of every
  // /dashboard/** route throwing a raw 500.
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
            <Link href="/dashboard" className="header-link">Overview</Link>
            <Link href="/dashboard/credits" className="header-link">Credits</Link>
            <Link href="/dashboard/opportunities" className="header-link">Opportunities</Link>
            <Link href="/dashboard/mentions" className="header-link">Mentions</Link>
            <Link href="/dashboard/reports" className="header-link">Reports</Link>
            <Link href="/dashboard/drafts" className="header-link">Drafts</Link>
            <Link href="/dashboard/tasks" className="header-link">Track Tasks</Link>
            <Link href="/dashboard/billing" className="header-link">Billing</Link>
          </div>
        </div>
      </section>
      {children}
      <Footer />
    </>
  );
}
