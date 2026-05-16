"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useAttendanceStore } from "@/stores/attendance.store";
import type { AttendanceStatus } from "@/components/feature/absensi/types/attendance.type";
import { STATUS_LABELS, STATUS_ICONS } from "@/components/feature/absensi/types/attendance.type";

interface AttendanceTableProps {
  selectedDate: string;
}

const statusStyles: Record<AttendanceStatus, { active: string; ring: string }> = {
  present: {
    active: "bg-[#34d058] text-white border-[#34d058]",
    ring: "ring-[#34d058]/20",
  },
  late: {
    active: "bg-[#f5c542] text-white border-[#f5c542]",
    ring: "ring-[#f5c542]/20",
  },
  excused: {
    active: "bg-secondary text-white border-secondary",
    ring: "ring-secondary/20",
  },
  absent: {
    active: "bg-error text-white border-error",
    ring: "ring-error/20",
  },
};

const divisions = ["Semua", "Photography & Videography", "Graphic Design", "Kominfo"];
const divisionShort: Record<string, string> = {
  "Semua": "Semua",
  "Photography & Videography": "Photo & Video",
  "Graphic Design": "Design",
  "Kominfo": "Kominfo",
};

export default function AttendanceTable({ selectedDate }: AttendanceTableProps) {
  const { members, setAttendance, markAllPresent, clearDate, getMemberStatus } =
    useAttendanceStore();
  const [filterDivision, setFilterDivision] = useState("Semua");

  const filteredMembers =
    filterDivision === "Semua"
      ? members
      : members.filter((m) => m.division === filterDivision);

  const allStatuses: AttendanceStatus[] = ["present", "late", "excused", "absent"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-primary">Daftar Anggota</h2>
          <p className="text-[10px] sm:text-sm text-on-surface-variant mt-0.5">
            {filteredMembers.length} anggota
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => markAllPresent(selectedDate)}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-lg sm:rounded-xl bg-[#34d058]/10 text-[#34d058] border border-[#34d058]/20 hover:bg-[#34d058]/20 transition-all duration-300"
          >
            <Icon name="done_all" size="sm" />
            <span className="hidden sm:inline">All</span> Hadir
          </button>
          <button
            onClick={() => clearDate(selectedDate)}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-lg sm:rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all duration-300"
          >
            <Icon name="clear_all" size="sm" />
            Clear
          </button>
        </div>
      </div>

      {/* Division Filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {divisions.map((div) => (
          <button
            key={div}
            onClick={() => setFilterDivision(div)}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
              ${
                filterDivision === div
                  ? "bg-secondary text-on-secondary border border-transparent"
                  : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"
              }
            `}
          >
            <span className="sm:hidden">{divisionShort[div]}</span>
            <span className="hidden sm:inline">{div}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {filteredMembers.map((member, index) => {
          const currentStatus = getMemberStatus(member.id, selectedDate);

          return (
            <div
              key={member.id}
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30 transition-all duration-200"
            >
              {/* Member Info Row */}
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-secondary/8 border border-secondary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-primary truncate">
                    {member.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-on-surface-variant/45 uppercase tracking-widest font-medium">
                    {member.division}
                  </span>
                </div>
              </div>

              {/* Status Buttons — full width on mobile */}
              <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2 sm:ml-[46px]">
                {allStatuses.map((status) => {
                  const isActive = currentStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setAttendance(member.id, selectedDate, status)}
                      className={`
                        flex items-center justify-center gap-1 px-1 sm:px-3 py-2 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border transition-all duration-200
                        ${
                          isActive
                            ? `${statusStyles[status].active} ring-2 ${statusStyles[status].ring} shadow-sm`
                            : "border-outline-variant/15 text-on-surface-variant/40 hover:border-outline-variant/30 hover:bg-surface-container-low"
                        }
                      `}
                    >
                      <Icon
                        name={STATUS_ICONS[status]}
                        size="sm"
                        className={isActive ? "text-white" : ""}
                      />
                      <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
