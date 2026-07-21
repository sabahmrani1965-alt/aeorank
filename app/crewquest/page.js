import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableMissions } from "@/lib/posterTasks";
import CrewQuestNav from "@/components/crewquest/Nav";
import Hero from "@/components/crewquest/Hero";
import FoundingBanner from "@/components/crewquest/FoundingBanner";
import HowItWorks from "@/components/crewquest/HowItWorks";
import Faq from "@/components/crewquest/Faq";
import CrewQuestFooter from "@/components/crewquest/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CrewQuest — Complete Missions. Get Paid.",
  description:
    "CrewQuest is a creator marketplace. Complete real posting and commenting missions on Reddit and get paid per mission.",
};

export default async function CrewQuestLandingPage() {
  const admin = createAdminClient();

  let missions = [];
  let posterCount = 0;
  if (admin) {
    const [missionResult, { count }] = await Promise.all([
      getAvailableMissions(admin),
      admin.from("users").select("id", { count: "exact", head: true }).eq("role", "poster"),
    ]);
    missions = missionResult;
    posterCount = count || 0;
  }

  return (
    <div className="kc-theme cq-landing">
      <CrewQuestNav />
      <Hero liveMissionCount={missions.length} previewMission={missions[0] || null} />
      <FoundingBanner posterCount={posterCount} />
      <HowItWorks />
      <Faq />
      <CrewQuestFooter />
    </div>
  );
}
