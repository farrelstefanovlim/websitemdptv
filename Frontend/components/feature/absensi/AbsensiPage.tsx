"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import AttendanceTable from "@/components/feature/absensi/AttendanceTable";
import AttendanceSummary from "@/components/feature/absensi/AttendanceSummary";
import AbsensiRekapModal from "@/components/feature/absensi/AbsensiRekapModal";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, ABSENSI_COLUMNS } from "@/lib/excel";
import { toast } from "@/stores/toast.store";
import ActionMenu from "@/components/ui/ActionMenu";

import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import { formatDateDisplay, getToday } from "./utils";

export default function AbsensiPage() {
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const topbarTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showRekapModal, setShowRekapModal] = useState(false);
  const { members, records, setAttendance, fetchMembers, fetchRecords, toggleLockDate, isDateLocked } = useAttendanceStore();
  const hydrated = useHydrated();
  const importRef = useRef<HTMLInputElement>(null);
  
  const isLocked = isDateLocked(selectedDate);

  // Fetch data dari API saat mount
  useEffect(() => {
    fetchMembers();
    fetchRecords();
  }, [fetchMembers, fetchRecords]);

  const handleExport = () => {
    const statusMap: Record<string, string> = {
      present: "Hadir",
      late: "Terlambat",
      excused: "Izin",
      absent: "Absen",
    };

    const exportData = members.map((m) => {
      const record = records.find((r) => r.memberId === m.id && r.date === selectedDate);
      return {
        npm: m.npm || "-",
        name: m.name,
        phone: m.phone || "-",
        email: m.email || "-",
        status: statusMap[record?.status || ""] || "Belum Absen",
        division: m.division || "Umum",
        date: selectedDate,
      };
    });
    exportToExcel(exportData, ABSENSI_COLUMNS, `absensi_mdptv_${selectedDate}`, "Absensi Harian");
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
      toast.success(`Berhasil import ${imported} data absensi`);
    } catch { toast.error("Gagal membaca file Excel"); }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Rekap Absensi
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        {formatDateDisplay(selectedDate)}
      </p>
    </div>
  );

  const topbarActions = (
    <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant/15 rounded-xl p-0.5 shadow-sm">
      <Button
        variant="none"
        size="none"
        onClick={() => {
          const d = new Date(selectedDate + "T00:00:00");
          d.setDate(d.getDate() - 1);
          setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:bg-surface-container-lowest hover:text-primary transition-colors"
      >
        <Icon name="chevron_left" size="sm" className="!text-xs" />
      </Button>

      <div className="w-28 sm:w-32">
        <DatePicker
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="!py-0 !h-7 w-full !border-none !shadow-none !bg-transparent !ring-0 !justify-center gap-1 text-center font-bold text-xs"
        />
      </div>

      <Button
        variant="none"
        size="none"
        onClick={() => {
          const d = new Date(selectedDate + "T00:00:00");
          d.setDate(d.getDate() + 1);
          setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:bg-surface-container-lowest hover:text-primary transition-colors"
      >
        <Icon name="chevron_right" size="sm" className="!text-xs" />
      </Button>
    </div>
  );

  return (
    <>
      {hydrated && topbarTitlePortalTarget && createPortal(topbarTitle, topbarTitlePortalTarget)}
      {hydrated && portalTarget && createPortal(topbarActions, portalTarget)}

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Summary — shown first on mobile */}
          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-4 sm:p-6 lg:sticky lg:top-24">
              <AttendanceSummary selectedDate={selectedDate} />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 lg:order-1">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-4 sm:p-6">
              <AttendanceTable selectedDate={selectedDate} actions={
                <>
                  <ActionMenu actions={[
                    { label: "Hari Ini", icon: "today", onClick: () => setSelectedDate(getToday()) },
                    { label: "Rekap Data", icon: "date_range", onClick: () => setShowRekapModal(true) },
                    { label: isLocked ? "Buka Kunci" : "Kunci", icon: isLocked ? "lock_open" : "lock", onClick: () => toggleLockDate(selectedDate), variant: isLocked ? "default" : "danger" },
                    { label: "Import Excel", icon: "upload", onClick: () => importRef.current?.click() },
                    { label: "Export Harian", icon: "download", onClick: handleExport, variant: "success" },
                  ]} />
                  <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                </>
              } />
            </div>
          </div>
        </div>
      </div>

      {/* Recap Modal */}
      {showRekapModal && <AbsensiRekapModal onClose={() => setShowRekapModal(false)} />}
    </>
  );
}
