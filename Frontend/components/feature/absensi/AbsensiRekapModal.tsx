"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import Modal from "@/components/ui/Modal";
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
        npm: m.npm || "-",
        nama: m.name,
        phone: m.phone || "-",
        email: m.email || "-",
        divisi: m.division || "Umum",
        hadir: present,
        terlambat: late,
        izin: excused,
        alpa: absent,
      };
    });

    const cols = [
      { key: "npm", header: "NPM" },
      { key: "nama", header: "Nama Anggota" },
      { key: "phone", header: "No HP" },
      { key: "email", header: "Email" },
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
    <Modal
      isOpen={true}
      onClose={onClose}
      size="sm"
      title="Rekap Rentang Tanggal"
      description="Ekspor ringkasan kehadiran anggota ke dokumen Excel"
      headerIcon="date_range"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={!startDate || !endDate}
            startIcon={<Icon name="download" size="sm" />}
          >
            Export Rekap Excel
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <DatePicker
          label="Mulai Tanggal"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <DatePicker
          label="Sampai Tanggal"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}
