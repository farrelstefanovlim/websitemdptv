"use client";

import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useAttendanceStore } from "@/stores/attendance.store";
import type { AttendanceStatus } from "@/components/feature/absensi/types/attendance.type";
import { STATUS_LABELS, STATUS_ICONS } from "@/components/feature/absensi/types/attendance.type";
import ActionMenu from "@/components/ui/ActionMenu";
import api from "@/lib/axios";

interface AttendanceTableProps {
  selectedDate: string;
  actions?: React.ReactNode;
}

const statusStyles: Record<AttendanceStatus, { active: string; ring: string }> = {
  present: {
    active: "bg-green-500 text-white border-green-500",
    ring: "ring-green-500/20",
  },
  late: {
    active: "bg-yellow-500 text-white border-yellow-500",
    ring: "ring-yellow-500/20",
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

const DEFAULT_DIVISIONS = [
  "Photography & Videography",
  "Graphic Design",
  "Kominfo",
  "Pengelola Sumber Daya Manusia",
  "Hubungan Masyarakat",
];

export default function AttendanceTable({ selectedDate, actions }: AttendanceTableProps) {
  const { members, setAttendance, markAllPresent, clearDate, getMemberStatus, isDateLocked } =
    useAttendanceStore();
  const [filterDivision, setFilterDivision] = useState("Semua");
  const [search, setSearch] = useState("");
  const [dbDivisions, setDbDivisions] = useState<string[]>([]);
  const isLocked = isDateLocked(selectedDate);

  useEffect(() => {
    api.get("/divisions")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDbDivisions(res.data.data.map((d: any) => d.name));
        }
      })
      .catch(() => {});
  }, []);

  const dynamicDivisions = useMemo(() => {
    const fromMembers = members.map((m) => m.division).filter(Boolean);
    const base = dbDivisions.length > 0 ? dbDivisions : DEFAULT_DIVISIONS;
    return ["Semua", ...Array.from(new Set([...base, ...fromMembers]))];
  }, [dbDivisions, members]);

  const filteredMembers = members.filter((m) => {
    const matchesDiv = filterDivision === "Semua" || m.division === filterDivision;
    const s = search.toLowerCase();
    const matchesSearch = !s || m.name.toLowerCase().includes(s);
    return matchesDiv && matchesSearch;
  });

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
          {isLocked && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-red-50 text-red-500 rounded-lg sm:rounded-xl border border-red-200">
              <Icon name="lock" size="sm" className="!text-xs sm:!text-sm" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:inline">Terkunci</span>
            </div>
          )}
          {!isLocked && (
            <>
              <Button variant="none" size="none"
                onClick={() => markAllPresent(selectedDate)}
                className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-lg sm:rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-all duration-300"
              >
                <Icon name="done_all" size="sm" />
                <span className="hidden sm:inline">All</span> Hadir
              </Button>
              <Button variant="none" size="none"
                onClick={() => clearDate(selectedDate)}
                className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-lg sm:rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all duration-300"
              >
                <Icon name="clear_all" size="sm" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Toolbar: Search, Filter & Actions */}
      <div className="mb-6 flex items-center gap-2 w-full">
        {/* Search */}
        <div className="relative flex-1">
          <Icon name="search" size="sm" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-sm focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
            placeholder="Cari nama anggota..." />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Menu */}
          <ActionMenu triggerIcon="filter_list" title="Saring Divisi" actions={[
            ...dynamicDivisions.map(d => ({
              label: d,
              icon: "group",
              active: filterDivision === d,
              onClick: () => setFilterDivision(d)
            }))
          ]} />

          {/* Page Actions */}
          {actions}
        </div>
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
                    <Button variant="none" size="none"
                      key={status}
                      onClick={() => setAttendance(member.id, selectedDate, status)}
                      disabled={isLocked}
                      className={`
                        flex items-center justify-center gap-1 px-1 sm:px-3 py-2 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border transition-all duration-200
                        ${
                          isActive
                            ? `${statusStyles[status].active} ring-2 ${statusStyles[status].ring} shadow-sm`
                            : isLocked 
                              ? "border-outline-variant/10 text-on-surface-variant/20 bg-surface-container-lowest"
                              : "border-outline-variant/15 text-on-surface-variant/40 hover:border-outline-variant/30 hover:bg-surface-container-low"
                        }
                        ${isActive && isLocked ? "opacity-75" : ""}
                      `}
                    >
                      <Icon
                        name={STATUS_ICONS[status]}
                        size="sm"
                        className={isActive ? "text-white" : ""}
                      />
                      <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
                    </Button>
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
