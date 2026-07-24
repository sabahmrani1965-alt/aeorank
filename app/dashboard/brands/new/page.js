import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listBrands, brandLimitForPlan } from "@/lib/brands";
import CompanyProfileForm from "@/components/CompanyProfileForm";

export const dynamic = "force-dynamic";

export default async function NewBrandPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subs }, brands] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    listBrands(supabase, user.id),
  ]);
  const sub = subs?.[0];
  const plan = sub && ["active", "trialing"].includes(sub.status) ? sub.plan : null;
  const limit = brandLimitForPlan(plan);

  if (brands.length >= limit) {
    return (
      <section className="dashboard-page">
        <h2 style={{ marginBottom: 8 }}>Add a brand</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>
          You're using {brands.length} of {limit} brand{limit === 1 ? "" : "s"} on your current plan.
          Upgrade to add more.
        </p>
        <a href="/dashboard/billing" className="btn btn-primary">
          View plans →
        </a>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <h2 style={{ marginBottom: 8 }}>Add a brand</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 28, maxWidth: 640 }}>
        Set up another brand: its opportunities, mentions, prompts, reports, and tasks are tracked
        separately from your other brands.
      </p>
      <CompanyProfileForm mode="create" />
    </section>
  );
}
