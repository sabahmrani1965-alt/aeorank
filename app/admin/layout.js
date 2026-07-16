import { redirect } from "next/navigation";
import Link from "next/link";
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
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
            <Link href="/admin" className="header-link">Overview</Link>
            <Link href="/admin/users" className="header-link">Users</Link>
            <Link href="/admin/credits" className="header-link">Credits</Link>
          </div>
        </div>
      </section>
      {children}
      <Footer />
    </>
  );
}
