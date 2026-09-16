"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import OverviewDashboard from "@/components/feature/dashboard/OverviewDashboard";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const topbarTitlePortalTarget = usePortalTarget("mobile-topbar-title");

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Monitoring Dashboard
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        Ikhtisar aktivitas dan operasional studio
      </p>
    </div>
  );

  return (
    <>
      {hydrated && topbarTitlePortalTarget && createPortal(topbarTitle, topbarTitlePortalTarget)}

      {/* Main Page Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <OverviewDashboard />
        </div>
      </div>
    </>
  );
}
