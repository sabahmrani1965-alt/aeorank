"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import StatsBar from "./StatsBar";

export default function PosterShell({ email, stats, notifications, discordUrl, children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="kc-theme">
      <div className="app-shell">
        <Sidebar
          email={email}
          pending={stats.pending}
          discordUrl={discordUrl}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="app-main">
          <TopHeader email={email} notifications={notifications} onOpenSidebar={() => setSidebarOpen(true)} />
          <StatsBar
            totalEarned={stats.totalEarned}
            tasksCompleted={stats.tasksCompleted}
            streak={stats.streak}
            dailyCount={stats.dailyCount}
            dailyLimit={stats.dailyLimit}
          />
          <main className="app-content">
            <div className="dashboard-page">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
