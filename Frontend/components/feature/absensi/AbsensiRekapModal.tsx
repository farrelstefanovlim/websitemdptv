"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { useAttendanceStore } from "@/stores/attendance.store";
import { exportToExcel } from "@/lib/excel";

interface AbsensiRekapModalProps {
  onClose: () => void;
}

export default function AbsensiRekapModal({ onClose }: AbsensiRekapModalProps) {
  const { members, records } = useAttendanceStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExport = () => {
    if (!startDate || !endDate) return;

    const filteredRecords = records.filter(
      (r) => r.date >= startDate && r.date <= endDate
    );

    const recapData = members.map((m) => {
      const memberRecords = filteredRecords.filter((r) => r.memberId === m.id);
      const present = memberRecords.filter((r) => r.status === "present").length;
      const late = memberRecords.filter((r) => r.status === "late").length;
      const excused = memberRecords.filter((r) => r.status === "excused").length;
      const absent = memberRecords.filter((r) => r.status === "absent").length;
      return {
        nama: m.name,
        divisi: m.division || "Umum",
        hadir: present,
        terlambat: late,
        izin: excused,
        alpa: absent,
      };
    });

    const cols = [
      { key: "nama", header: "Nama Lengkap" },
      { key: "divisi", header: "Divisi" },
      { key: "hadir", header: "Hadir" },
      { key: "terlambat", header: "Terlambat" },
      { key: "izin", header: "Izin" },
      { key: "alpa", header: "Alpa/Absen" },
    ];

    exportToExcel(
      recapData,
      cols,
      `rekap_absensi_${startDate}_to_${endDate}`,
      "Rekap Absensi"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-outline-variant/15">
        <div className="p-5 sm:p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-primary font-display flex items-center gap-2">
            <Icon name="date_range" className="text-secondary" />
            Rekap Rentang Tanggal
          </h3>
          <Button variant="icon" size="icon" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Mulai Tanggal
            </label>
            <DatePicker value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Sampai Tanggal
            </label>
            <DatePicker value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="p-5 sm:p-6 border-t border-outline-variant/10 flex gap-2.5 justify-end bg-surface-container-low/40 mt-auto">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={!startDate || !endDate}
          >
            <Icon name="download" size="sm" />
            <span>Export Rekap Excel</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
