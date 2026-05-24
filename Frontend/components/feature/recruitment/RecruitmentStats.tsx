"use client";

import Icon from "@/components/ui/Icon";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import type { RecruitmentStatus } from "@/components/feature/recruitment/types/recruitment.type";
import { STATUS_LABELS, STATUS_COLORS } from "@/components/feature/recruitment/types/recruitment.type";

const statItems: { status: RecruitmentStatus; icon: string }[] = [
  { status: "pending", icon: "hourglass_top" },
  { status: "interview", icon: "mic" },
  { status: "accepted", icon: "check_circle" },
  { status: "rejected", icon: "cancel" },
];

export default function RecruitmentStats() {
  const { applicants } = useRecruitmentStore();
  const total = applicants.length;

  const counts: Record<RecruitmentStatus, number> = {
    pending: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  };
  applicants.forEach((a) => counts[a.status]++);

  const acceptRate = total > 0 ? Math.round((counts.accepted / total) * 100) : 0;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">
        Statistik Penerimaan
      </h3>

      {/* Overview Card */}
      <div className="bg-surface-container-low rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] sm:text-xs text-on-surface-variant/50 uppercase tracking-widest font-bold">
            Total Pendaftar
          </span>
          <span className="text-[10px] sm:text-xs text-on-surface-variant/40">
            {acceptRate}% diterima
          </span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-primary mb-3">
          {total}
          <span className="text-base sm:text-lg text-on-surface-variant/30 ml-1">orang</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 sm:h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full flex rounded-full overflow-hidden">
            {counts.accepted > 0 && (
              <div className="bg-green-500 transition-all duration-500"
                style={{ width: `${(counts.accepted / total) * 100}%` }} />
            )}
            {counts.interview > 0 && (
              <div className="bg-secondary transition-all duration-500"
                style={{ width: `${(counts.interview / total) * 100}%` }} />
            )}
            {counts.pending > 0 && (
              <div className="bg-orange-500 transition-all duration-500"
                style={{ width: `${(counts.pending / total) * 100}%` }} />
            )}
            {counts.rejected > 0 && (
              <div className="bg-error transition-all duration-500"
                style={{ width: `${(counts.rejected / total) * 100}%` }} />
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
        {statItems.map(({ status, icon }) => {
          const colors = STATUS_COLORS[status];
          return (
            <div key={status} className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border ${colors.bg} ${colors.border} hover:scale-[1.02] hover:shadow-sm transition-all duration-300`}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-white/40 group-hover:bg-white/70">
                  <Icon name={icon} size="sm" className={`${colors.text} !text-base sm:!text-xl`} />
                </div>
                <span className={`text-[9px] sm:text-[11px] uppercase tracking-widest font-bold ${colors.text} hidden sm:inline`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <div className="text-2xl sm:text-4xl font-black text-primary text-center sm:text-left">
                {counts[status]}
              </div>
              <span className={`text-[8px] sm:text-[11px] uppercase tracking-wider font-bold ${colors.text} sm:hidden block text-center mt-0.5`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-Division Breakdown */}
      <div className="mt-3 sm:mt-4">
        <h4 className="text-[10px] sm:text-xs text-on-surface-variant/40 uppercase tracking-widest font-bold mb-2 sm:mb-3">
          Per Divisi
        </h4>
        <div className="flex flex-col gap-2">
          {["Photography & Videography", "Graphic Design", "Kominfo"].map((div) => {
            const divApplicants = applicants.filter((a) => a.division === div);
            const divAccepted = divApplicants.filter((a) => a.status === "accepted").length;
            return (
              <div key={div} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-[10px] sm:text-xs font-semibold text-primary truncate flex-1 min-w-0 mr-2">
                  {div}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] sm:text-xs text-green-500 font-bold">{divAccepted}</span>
                  <span className="text-[10px] text-on-surface-variant/30">/</span>
                  <span className="text-[10px] sm:text-xs text-on-surface-variant/50 font-medium">{divApplicants.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
