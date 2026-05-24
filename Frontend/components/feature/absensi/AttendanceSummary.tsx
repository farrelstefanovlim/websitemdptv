"use client";

import Icon from "@/components/ui/Icon";
import { useAttendanceStore } from "@/stores/attendance.store";
import type { AttendanceStatus } from "@/components/feature/absensi/types/attendance.type";
import { STATUS_LABELS } from "@/components/feature/absensi/types/attendance.type";

interface AttendanceSummaryProps {
  selectedDate: string;
}

const statCards: { status: AttendanceStatus; icon: string; color: string; bgColor: string }[] = [
  { status: "present", icon: "check_circle", color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/15" },
  { status: "late", icon: "schedule", color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/15" },
  { status: "excused", icon: "info", color: "text-secondary", bgColor: "bg-secondary/10 border-secondary/15" },
  { status: "absent", icon: "cancel", color: "text-error", bgColor: "bg-error/10 border-error/15" },
];

export default function AttendanceSummary({ selectedDate }: AttendanceSummaryProps) {
  const { members, records } = useAttendanceStore();
  const dateRecords = records.filter((r) => r.date === selectedDate);

  const counts: Record<AttendanceStatus, number> = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };
  dateRecords.forEach((r) => counts[r.status]++);

  const totalMarked = dateRecords.length;
  const attendanceRate = totalMarked > 0
    ? Math.round(((counts.present + counts.late) / totalMarked) * 100)
    : 0;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">Rekap Hari Ini</h3>

      {/* Attendance Rate */}
      <div className="bg-surface-container-low rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[9px] sm:text-xs text-on-surface-variant/50 uppercase tracking-widest font-bold">
            Tingkat Kehadiran
          </span>
          <span className="text-[10px] sm:text-xs text-on-surface-variant/40">
            {totalMarked}/{members.length} tercatat
          </span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-primary mb-2">
          {attendanceRate}
          <span className="text-base sm:text-lg text-on-surface-variant/30">%</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 sm:h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full flex rounded-full overflow-hidden">
            {totalMarked > 0 && counts.present > 0 && (
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${(counts.present / totalMarked) * 100}%` }}
              />
            )}
            {totalMarked > 0 && counts.late > 0 && (
              <div
                className="bg-yellow-500 transition-all duration-500"
                style={{ width: `${(counts.late / totalMarked) * 100}%` }}
              />
            )}
            {totalMarked > 0 && counts.excused > 0 && (
              <div
                className="bg-secondary transition-all duration-500"
                style={{ width: `${(counts.excused / totalMarked) * 100}%` }}
              />
            )}
            {totalMarked > 0 && counts.absent > 0 && (
              <div
                className="bg-error transition-all duration-500"
                style={{ width: `${(counts.absent / totalMarked) * 100}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
        {statCards.map(({ status, icon, color, bgColor }) => (
          <div
            key={status}
            className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border ${bgColor} hover:scale-[1.02] hover:shadow-sm transition-all duration-300`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-white/40 group-hover:bg-white/70">
                <Icon name={icon} size="sm" className={`${color} !text-base sm:!text-xl`} />
              </div>
              <span className={`text-[9px] sm:text-[11px] uppercase tracking-widest font-bold ${color} hidden sm:inline`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-primary text-center sm:text-left">
              {counts[status]}
            </div>
            <span className={`text-[8px] sm:text-[11px] uppercase tracking-wider font-bold ${color} sm:hidden block text-center mt-0.5`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
