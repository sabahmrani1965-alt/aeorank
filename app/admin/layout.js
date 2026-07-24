import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/adminAuth";

export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  return (
    <>
      <Header />
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          {/* Plain <a> tags, not next/link — admin data (subscriber counts,
              MRR, pending drafts) needs to always be current, and Next's
              client-side router cache can serve a stale copy of a route
              for a short window after navigating away and back. A full
              page reload on every admin tab switch guarantees fresh data;
              the SPA-transition speed tradeoff doesn't matter for a
              low-traffic internal tool. */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
            <a href="/admin" className="header-link">Overview</a>
            <a href="/admin/users" className="header-link">AEOrank Users</a>
            <a href="/admin/drafts" className="header-link">Posts</a>
            <a href="/admin/posters" className="header-link">CrewQuest Users</a>
            <a href="/admin/credits" className="header-link">Credits</a>
          </div>
        </div>
      </section>
      {children}
      <Footer />
    </>
  );
}
