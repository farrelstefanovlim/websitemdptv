"use client";

import Icon from "@/components/ui/Icon";
import { useAttendanceStore } from "@/stores/attendance.store";
import type { AttendanceStatus } from "@/components/feature/absensi/types/attendance.type";
import { STATUS_LABELS } from "@/components/feature/absensi/types/attendance.type";

interface AttendanceSummaryProps {
  selectedDate: string;
}

const statCards: {
  status: AttendanceStatus;
  icon: string;
  color: string;
  textColor: string;
  bgColor: string;
}[] = [
  {
    status: "present",
    icon: "check_circle",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-500/5 border-emerald-500/20",
  },
  {
    status: "late",
    icon: "schedule",
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-500/5 border-amber-500/20",
  },
  {
    status: "excused",
    icon: "info",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-500/5 border-blue-500/20",
  },
  {
    status: "absent",
    icon: "cancel",
    color: "bg-rose-500",
    textColor: "text-rose-700",
    bgColor: "bg-rose-500/5 border-rose-500/20",
  },
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
  const attendanceRate =
    totalMarked > 0
      ? Math.round(((counts.present + counts.late) / totalMarked) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/10">
        <div>
          <h3 className="text-base font-bold text-primary font-display">
            Ringkasan Kehadiran
          </h3>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold">
            Status tanggal terpilih
          </p>
        </div>
      </div>

      {/* Attendance Rate Banner */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 mb-4 border border-outline-variant/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/60">
            Tingkat Kehadiran
          </span>
          <span className="text-xs font-semibold text-on-surface-variant/70">
            {totalMarked}/{members.length} tercatat
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-3xl sm:text-4xl font-black text-primary font-display">
            {attendanceRate}%
          </span>
          <span className="text-xs text-on-surface-variant/50 font-medium">
            rasio hadir & telat
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex ring-1 ring-inset ring-outline-variant/10">
          {totalMarked > 0 ? (
            <>
              {counts.present > 0 && (
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(counts.present / totalMarked) * 100}%` }}
                />
              )}
              {counts.late > 0 && (
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${(counts.late / totalMarked) * 100}%` }}
                />
              )}
              {counts.excused > 0 && (
                <div
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${(counts.excused / totalMarked) * 100}%` }}
                />
              )}
              {counts.absent > 0 && (
                <div
                  className="bg-rose-500 transition-all duration-500"
                  style={{ width: `${(counts.absent / totalMarked) * 100}%` }}
                />
              )}
            </>
          ) : (
            <div className="w-full bg-outline-variant/15" />
          )}
        </div>
      </div>

      {/* Status Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map(({ status, icon, textColor, bgColor }) => (
          <div
            key={status}
            className={`p-3 sm:p-4 rounded-2xl border transition-all ${bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name={icon} size="sm" className={textColor} filled />
              <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${textColor}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-display">
              {counts[status]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
