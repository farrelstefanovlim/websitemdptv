"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import OverviewDashboard from "@/components/feature/dashboard/OverviewDashboard";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");

  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Overview
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        Monitoring & Statistik
      </p>
    </div>
  );

  return (
    <>
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      
      {/* Top Bar Desktop */}
      <header className="hidden lg:block sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">
              Monitoring Dashboard
            </h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50 hidden sm:block">
              Ikhtisar seluruh aktivitas dan data platform
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <OverviewDashboard />
        </div>
      </div>
    </>
  );
}
