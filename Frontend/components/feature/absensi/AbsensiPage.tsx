"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import AttendanceTable from "@/components/feature/absensi/AttendanceTable";
import AttendanceSummary from "@/components/feature/absensi/AttendanceSummary";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, ABSENSI_COLUMNS } from "@/lib/excel";

import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import { formatDateDisplay, getToday } from "./utils";

export default function AbsensiPage() {
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const { members, records, setAttendance } = useAttendanceStore();
  const hydrated = useHydrated();
  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = members.map((m) => {
      const record = records.find((r) => r.memberId === m.id && r.date === selectedDate);
      return { name: m.name, division: m.division, date: selectedDate, status: record?.status || "belum" };
    });
    exportToExcel(exportData, ABSENSI_COLUMNS, `absensi_${selectedDate}`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importFromExcel(
        file,
        ABSENSI_COLUMNS
      );
      let imported = 0;
      for (const row of rows) {
        if (!row.name || !row.status) continue;
        const member = members.find((m) => m.name.toLowerCase() === row.name!.toLowerCase());
        if (member && ["present", "absent", "late", "excused"].includes(row.status!)) {
          setAttendance(member.id, row.date || selectedDate, row.status as "present" | "absent" | "late" | "excused");
          imported++;
        }
      }
      alert(`Berhasil import ${imported} data absensi`);
    } catch { alert("Gagal membaca file Excel"); }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const mobileActions = (
    <>
      <Button variant="success" size="none" onClick={handleExport} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="download" size="sm" />
      </Button>
      <Button variant="outline" size="none" onClick={() => importRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="upload" size="sm" />
      </Button>
      <Button variant="secondary" size="none" onClick={() => setSelectedDate(getToday())} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="today" size="sm" />
      </Button>
      <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
    </>
  );

  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Absensi
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        {formatDateDisplay(selectedDate)}
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(mobileActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      {/* Top Bar */}
      <header className="sticky top-[68px] lg:top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="px-4 sm:px-8 py-2.5 lg:py-4">
          {/* Title Row */}
          <div className="hidden lg:flex items-center justify-between mb-2 lg:mb-0">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-primary">
                Absensi
              </h2>
              <p className="text-[10px] sm:text-xs text-on-surface-variant/50">
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
              <Button variant="success" size="sm" onClick={handleExport} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs">
                <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => importRef.current?.click()} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs">
                <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
              </Button>
              <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
              <Button variant="secondary" size="md"
                onClick={() => setSelectedDate(getToday())}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs"
              >
                <Icon name="today" size="sm" />
                <span className="hidden xs:inline">Hari Ini</span>
              </Button>
            </div>
          </div>
          {/* Date Navigation */}
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <Button variant="none" size="none"
              onClick={() => {
                const d = new Date(selectedDate + "T00:00:00");
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:bg-surface-container-low hover:text-primary transition-all"
            >
              <Icon name="chevron_left" size="sm" />
            </Button>
            <div className="flex-1 sm:flex-none sm:w-40">
              <DatePicker
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="!py-1.5"
              />
            </div>
            <Button variant="none" size="none"
              onClick={() => {
                const d = new Date(selectedDate + "T00:00:00");
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:bg-surface-container-low hover:text-primary transition-all"
            >
              <Icon name="chevron_right" size="sm" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 sm:p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-8">
          {/* Summary — shown first on mobile */}
          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-3 sm:p-6 lg:sticky lg:top-24">
              <AttendanceSummary selectedDate={selectedDate} />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 lg:order-1">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-3 sm:p-6">
              <AttendanceTable selectedDate={selectedDate} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
