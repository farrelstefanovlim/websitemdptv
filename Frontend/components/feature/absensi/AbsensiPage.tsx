"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import AttendanceTable from "@/components/feature/absensi/AttendanceTable";
import AttendanceSummary from "@/components/feature/absensi/AttendanceSummary";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, ABSENSI_COLUMNS } from "@/lib/excel";

function formatDateDisplay(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AbsensiPage() {
  const [selectedDate, setSelectedDate] = useState(getToday);
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

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="px-4 sm:px-8 py-3 sm:py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-primary">
                Absensi
              </h2>
              <p className="text-[10px] sm:text-xs text-on-surface-variant/50">
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={handleExport}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
                title="Export ke Excel">
                <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
              </button>
              <button onClick={() => importRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                title="Import dari Excel">
                <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
              </button>
              <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
              <button
                onClick={() => setSelectedDate(getToday())}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl bg-secondary text-on-secondary hover:brightness-110 transition-all duration-300"
              >
                <Icon name="today" size="sm" />
                <span className="hidden xs:inline">Hari Ini</span>
              </button>
            </div>
          </div>
          {/* Date Navigation */}
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <button
              onClick={() => {
                const d = new Date(selectedDate + "T00:00:00");
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:bg-surface-container-low hover:text-primary transition-all"
            >
              <Icon name="chevron_left" size="sm" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary font-medium focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
            />
            <button
              onClick={() => {
                const d = new Date(selectedDate + "T00:00:00");
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:bg-surface-container-low hover:text-primary transition-all"
            >
              <Icon name="chevron_right" size="sm" />
            </button>
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
