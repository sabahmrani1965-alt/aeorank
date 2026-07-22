import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { displaySubreddit } from "@/lib/format";
import CampaignDetail from "@/components/CampaignDetail";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, target_url, subreddit, title, status, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!campaign) redirect("/dashboard/campaigns");

  const { data: snapshots } = await supabase
    .from("campaign_snapshots")
    .select("id, score, reply_count, removed, source, checked_at")
    .eq("campaign_id", campaign.id)
    .order("checked_at", { ascending: true });

  const { data: orders } = await supabase
    .from("campaign_orders")
    .select("id, provider, provider_order_id, quantity, status, error, submitted_at, last_polled_at, completed_at")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  return (
    <CampaignDetail
      campaign={{ ...campaign, subreddit: campaign.subreddit ? displaySubreddit(campaign.subreddit) : null }}
      initialSnapshots={snapshots || []}
      initialOrders={orders || []}
    />
  );
}
