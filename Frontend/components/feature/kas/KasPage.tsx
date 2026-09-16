"use client";

import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  kasService,
  KasRecord,
  KasSummary,
  KasUnpaidRecord,
  KasUnpaidSummary,
} from "@/services/kas.service";
import { exportToExcel } from "@/lib/excel";
import { exportToPDF } from "@/lib/pdf";
import * as XLSX from "xlsx";

export default function KasPage() {
  const [activeTab, setActiveTab] = useState<"LOG" | "UNPAID">("LOG");

  // ================= TAB 1: LOG TRANSAKSI KAS STATE =================
  const [records, setRecords] = useState<KasRecord[]>([]);
  const [summary, setSummary] = useState<KasSummary>({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldoAkhir: 0,
    totalTransaksi: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  // Form manual modal state - Log Transaksi
  const [showManualModal, setShowManualModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Kas Anggota",
    type: "IN" as "IN" | "OUT",
    amount: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= TAB 2: UNPAID KAS STATE =================
  const [unpaidRecords, setUnpaidRecords] = useState<KasUnpaidRecord[]>([]);
  const [unpaidSummary, setUnpaidSummary] = useState<KasUnpaidSummary>({
    totalBelumBayar: 0,
    totalLunas: 0,
    totalTunggakan: 0,
    totalAnggota: 0,
  });
  const [unpaidSearch, setUnpaidSearch] = useState("");
  const [unpaidStatusFilter, setUnpaidStatusFilter] = useState<"ALL" | "BELUM_BAYAR" | "LUNAS">("ALL");

  // Form manual modal state - Unpaid Kas
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);
  const [unpaidFormData, setUnpaidFormData] = useState({
    member_name: "",
    npm: "",
    division: "",
    period: "Januari 2026",
    amount: "",
    status: "BELUM_BAYAR" as "BELUM_BAYAR" | "LUNAS",
    notes: "",
  });
  const unpaidFileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const loadKasData = async () => {
    setIsLoading(true);
    try {
      const res = await kasService.getAll();
      if (res.success) {
        setRecords(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error("Gagal memuat data kas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnpaidData = async () => {
    setIsLoading(true);
    try {
      const res = await kasService.getUnpaid();
      if (res.success) {
        setUnpaidRecords(res.data);
        setUnpaidSummary(res.summary);
      }
    } catch (err) {
      console.error("Gagal memuat data tunggakan kas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "LOG") {
      loadKasData();
    } else {
      loadUnpaidData();
    }
  }, [activeTab]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Upload Excel Transaksi
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const parsedData = XLSX.utils.sheet_to_json(ws);

          await kasService.uploadJSON(parsedData);
          await loadKasData();
          alert("File Excel transaksi kas berhasil di-upload!");
        } catch (err: any) {
          alert("Gagal membaca file Excel. Pastikan format file sesuai.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err: any) {
      alert("Gagal mengunggah file.");
      setIsLoading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Upload Excel Unpaid
  const handleUnpaidFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const parsedData = XLSX.utils.sheet_to_json(ws);

          await kasService.uploadUnpaidJSON(parsedData);
          await loadUnpaidData();
          alert("Data Excel anggota belum bayar kas berhasil di-upload!");
        } catch (err: any) {
          alert("Gagal membaca file Excel tunggakan kas.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err: any) {
      alert("Gagal mengunggah file.");
      setIsLoading(false);
    } finally {
      if (unpaidFileInputRef.current) unpaidFileInputRef.current.value = "";
    }
  };

  // Submit manual Log Transaksi
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert("Mohon isi keterangan dan nominal.");
      return;
    }

    setIsSubmitting(true);
    try {
      await kasService.create({
        date: formData.date,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });

      setShowManualModal(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "Kas Anggota",
        type: "IN",
        amount: "",
        notes: "",
      });
      await loadKasData();
    } catch (err) {
      alert("Gagal menambah transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit manual Unpaid Kas
  const handleUnpaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unpaidFormData.member_name || !unpaidFormData.period) {
      alert("Mohon isi nama anggota dan periode.");
      return;
    }

    setIsSubmitting(true);
    try {
      await kasService.createUnpaid({
        member_name: unpaidFormData.member_name,
        npm: unpaidFormData.npm,
        division: unpaidFormData.division,
        period: unpaidFormData.period,
        amount: parseFloat(unpaidFormData.amount || "0"),
        status: unpaidFormData.status,
        notes: unpaidFormData.notes,
      });

      setShowUnpaidModal(false);
      setUnpaidFormData({
        member_name: "",
        npm: "",
        division: "",
        period: "Januari 2026",
        amount: "",
        status: "BELUM_BAYAR",
        notes: "",
      });
      await loadUnpaidData();
    } catch (err) {
      alert("Gagal menambah data tunggakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status Unpaid (BELUM_BAYAR <-> LUNAS)
  const handleToggleStatus = async (item: KasUnpaidRecord) => {
    const nextStatus = item.status === "BELUM_BAYAR" ? "LUNAS" : "BELUM_BAYAR";
    try {
      await kasService.updateUnpaid(item.id, { status: nextStatus });
      await loadUnpaidData();
    } catch (err) {
      alert("Gagal mengbarui status bayar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    try {
      await kasService.delete(id);
      await loadKasData();
    } catch (err) {
      alert("Gagal menghapus transaksi.");
    }
  };

  const handleDeleteUnpaid = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data tunggakan ini?")) return;
    try {
      await kasService.deleteUnpaid(id);
      await loadUnpaidData();
    } catch (err) {
      alert("Gagal menghapus data tunggakan.");
    }
  };

  const handleResetAll = async () => {
    if (!confirm("⚠️ PERINGATAN: Semua log transaksi kas akan dibersihkan! Lanjutkan?")) return;
    try {
      await kasService.deleteAll();
      await loadKasData();
    } catch (err) {
      alert("Gagal membersihkan log kas.");
    }
  };

  // Export Log Transaksi
  const handleExportExcel = () => {
    const columns = [
      { key: "No", header: "No" },
      { key: "Tanggal", header: "Tanggal" },
      { key: "Keterangan", header: "Keterangan" },
      { key: "Kategori", header: "Kategori" },
      { key: "Tipe", header: "Tipe" },
      { key: "Nominal", header: "Nominal" },
      { key: "Saldo_Akumulasi", header: "Saldo Akumulasi" },
      { key: "Catatan", header: "Catatan" },
    ];
    const exportData = filteredRecords.map((r, idx) => ({
      No: idx + 1,
      Tanggal: new Date(r.date).toLocaleDateString("id-ID"),
      Keterangan: r.description,
      Kategori: r.category || "Umum",
      Tipe: r.type === "IN" ? "Pemasukan (IN)" : "Pengeluaran (OUT)",
      Nominal: r.amount,
      Saldo_Akumulasi: r.balance,
      Catatan: r.notes || "-",
    }));
    exportToExcel(exportData, columns, `Pencatatan_Kas_MDPTV_${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ["No", "Tanggal", "Keterangan", "Tipe", "Nominal (Rp)", "Saldo (Rp)"];
    const body = filteredRecords.map((r, idx) => [
      (idx + 1).toString(),
      new Date(r.date).toLocaleDateString("id-ID"),
      r.description,
      r.type === "IN" ? "Masuk" : "Keluar",
      formatRupiah(r.amount),
      formatRupiah(r.balance),
    ]);

    exportToPDF({
      title: "Laporan Pencatatan Log Uang Kas MDPTV",
      headers,
      rows: body,
      filename: `Laporan_Kas_MDPTV_${new Date().toISOString().split("T")[0]}`,
    });
  };

  // Export Unpaid
  const handleExportUnpaidExcel = () => {
    const columns = [
      { key: "No", header: "No" },
      { key: "Nama_Anggota", header: "Nama Anggota" },
      { key: "NPM", header: "NPM" },
      { key: "Divisi", header: "Divisi" },
      { key: "Periode", header: "Periode" },
      { key: "Jumlah_Tunggakan", header: "Jumlah Tunggakan" },
      { key: "Status", header: "Status" },
      { key: "Keterangan", header: "Keterangan" },
    ];
    const exportData = filteredUnpaid.map((r, idx) => ({
      No: idx + 1,
      Nama_Anggota: r.member_name,
      NPM: r.npm || "-",
      Divisi: r.division || "-",
      Periode: r.period,
      Jumlah_Tunggakan: r.amount,
      Status: r.status,
      Keterangan: r.notes || "-",
    }));
    exportToExcel(exportData, columns, `Tunggakan_Kas_Anggota_${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportUnpaidPDF = () => {
    const headers = ["No", "Nama Anggota", "NPM", "Divisi", "Periode", "Tunggakan (Rp)", "Status"];
    const body = filteredUnpaid.map((r, idx) => [
      (idx + 1).toString(),
      r.member_name,
      r.npm || "-",
      r.division || "-",
      r.period,
      formatRupiah(r.amount),
      r.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR",
    ]);

    exportToPDF({
      title: "Laporan Anggota Belum Bayar Kas MDPTV",
      headers,
      rows: body,
      filename: `Laporan_Tunggakan_Kas_${new Date().toISOString().split("T")[0]}`,
    });
  };


  // Filter Log Transaksi
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.category && r.category.toLowerCase().includes(search.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Filter Unpaid
  const filteredUnpaid = unpaidRecords.filter((r) => {
    const matchesSearch =
      r.member_name.toLowerCase().includes(unpaidSearch.toLowerCase()) ||
      (r.npm && r.npm.toLowerCase().includes(unpaidSearch.toLowerCase())) ||
      (r.division && r.division.toLowerCase().includes(unpaidSearch.toLowerCase())) ||
      r.period.toLowerCase().includes(unpaidSearch.toLowerCase());
    const matchesStatus = unpaidStatusFilter === "ALL" || r.status === unpaidStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primary font-display flex items-center gap-2">
            <Icon name="account_balance_wallet" className="text-secondary" />
            Manajemen Uang Kas MDPTV
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Kelola transaksi pencatatan arus kas dan pendataan anggota yang belum membayar kas.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/15 text-xs font-bold">
          <button
            onClick={() => setActiveTab("LOG")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "LOG"
                ? "bg-secondary text-white shadow-sm"
                : "text-on-surface-variant/70 hover:text-primary hover:bg-background"
            }`}
          >
            <Icon name="receipt_long" size="sm" />
            <span>Log Transaksi Kas</span>
          </button>
          <button
            onClick={() => setActiveTab("UNPAID")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "UNPAID"
                ? "bg-secondary text-white shadow-sm"
                : "text-on-surface-variant/70 hover:text-primary hover:bg-background"
            }`}
          >
            <Icon name="person_remove" size="sm" />
            <span>Belum Bayar Kas ({unpaidSummary.totalBelumBayar})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: LOG TRANSAKSI KAS ================= */}
      {activeTab === "LOG" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon name="arrow_downward" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Total Pemasukan
                </p>
                <p className="text-lg font-black text-emerald-600 font-display">
                  {formatRupiah(summary.totalPemasukan)}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Icon name="arrow_upward" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Total Pengeluaran
                </p>
                <p className="text-lg font-black text-rose-600 font-display">
                  {formatRupiah(summary.totalPengeluaran)}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Icon name="account_balance" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Saldo Akhir
                </p>
                <p className="text-lg font-black text-secondary font-display">
                  {formatRupiah(summary.saldoAkhir)}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Icon name="format_list_bulleted" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Total Transaksi
                </p>
                <p className="text-lg font-black text-primary font-display">
                  {summary.totalTransaksi} Record
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  className="!rounded-xl"
                >
                  <Icon name="upload_file" size="sm" />
                  <span>Upload Excel Transaksi</span>
                </Button>

                <Button
                  onClick={() => setShowManualModal(true)}
                  variant="outline"
                  className="!rounded-xl"
                >
                  <Icon name="add" size="sm" />
                  <span>Tambah Manual</span>
                </Button>

                {records.length > 0 && (
                  <button
                    onClick={handleResetAll}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 px-3 py-2"
                  >
                    <Icon name="delete_sweep" size="sm" />
                    <span>Reset Log</span>
                  </button>
                )}
              </div>

              {/* Exports */}
              <div className="flex items-center gap-2">
                <Button onClick={handleExportExcel} variant="outline" size="sm">
                  <Icon name="table_view" size="sm" className="text-emerald-600" />
                  <span>Export Excel</span>
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <Icon name="picture_as_pdf" size="sm" className="text-rose-600" />
                  <span>Export PDF</span>
                </Button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-outline-variant/10">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
                  size="sm"
                />
                <input
                  type="text"
                  placeholder="Cari transaksi berdasarkan keterangan / kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant/20 bg-background text-xs font-medium text-primary focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setTypeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    typeFilter === "ALL" ? "bg-background text-primary shadow-xs" : "text-on-surface-variant/60"
                  }`}
                >
                  Semua ({records.length})
                </button>
                <button
                  onClick={() => setTypeFilter("IN")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    typeFilter === "IN" ? "bg-background text-emerald-600 shadow-xs" : "text-on-surface-variant/60"
                  }`}
                >
                  Masuk (IN)
                </button>
                <button
                  onClick={() => setTypeFilter("OUT")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    typeFilter === "OUT" ? "bg-background text-rose-600 shadow-xs" : "text-on-surface-variant/60"
                  }`}
                >
                  Keluar (OUT)
                </button>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs font-bold text-on-surface-variant/60">
                Memuat data kas...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Icon name="receipt_long" size="lg" className="text-on-surface-variant/30" />
                <p className="text-xs font-bold text-on-surface-variant/60">
                  Belum ada log transaksi kas. Unggah file Excel atau tambah manual.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline-variant/15 text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70">
                      <th className="p-4">No</th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Keterangan</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Tipe</th>
                      <th className="p-4 text-right">Nominal</th>
                      <th className="p-4 text-right">Saldo Akumulasi</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-medium">
                    {filteredRecords.map((r, idx) => {
                      const isIncome = r.type === "IN";
                      return (
                        <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4 font-bold text-on-surface-variant/50">{idx + 1}</td>
                          <td className="p-4 whitespace-nowrap text-on-surface-variant">
                            {new Date(r.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 font-bold text-primary max-w-xs truncate">{r.description}</td>
                          <td className="p-4 text-on-surface-variant/70">{r.category || "Umum"}</td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                isIncome
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              }`}
                            >
                              <Icon name={isIncome ? "arrow_downward" : "arrow_upward"} size="sm" className="!text-[12px]" />
                              {isIncome ? "MASUK" : "KELUAR"}
                            </span>
                          </td>
                          <td className={`p-4 text-right font-bold whitespace-nowrap ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                            {isIncome ? "+" : "-"}{formatRupiah(r.amount)}
                          </td>
                          <td className="p-4 text-right font-black text-primary whitespace-nowrap">
                            {formatRupiah(r.balance)}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Icon name="delete" size="sm" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: UNPAID KAS (BELUM BAYAR) ================= */}
      {activeTab === "UNPAID" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Icon name="person_remove" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Belum Bayar
                </p>
                <p className="text-xl font-black text-rose-600 font-display">
                  {unpaidSummary.totalBelumBayar} Anggota
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Icon name="payments" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Total Tunggakan
                </p>
                <p className="text-xl font-black text-amber-600 font-display">
                  {formatRupiah(unpaidSummary.totalTunggakan)}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon name="check_circle" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Sudah Lunas
                </p>
                <p className="text-xl font-black text-emerald-600 font-display">
                  {unpaidSummary.totalLunas} Anggota
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar Unpaid */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={unpaidFileInputRef}
                  onChange={handleUnpaidFileUpload}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                <Button
                  onClick={() => unpaidFileInputRef.current?.click()}
                  variant="primary"
                  className="!rounded-xl"
                >
                  <Icon name="upload_file" size="sm" />
                  <span>Upload Excel Belum Bayar</span>
                </Button>

                <Button
                  onClick={() => setShowUnpaidModal(true)}
                  variant="outline"
                  className="!rounded-xl"
                >
                  <Icon name="person_add" size="sm" />
                  <span>Tambah Anggota</span>
                </Button>
              </div>

              {/* Exports */}
              <div className="flex items-center gap-2">
                <Button onClick={handleExportUnpaidExcel} variant="outline" size="sm">
                  <Icon name="table_view" size="sm" className="text-emerald-600" />
                  <span>Export Excel</span>
                </Button>
                <Button onClick={handleExportUnpaidPDF} variant="outline" size="sm">
                  <Icon name="picture_as_pdf" size="sm" className="text-rose-600" />
                  <span>Export PDF</span>
                </Button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-outline-variant/10">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
                  size="sm"
                />
                <input
                  type="text"
                  placeholder="Cari nama anggota, NPM, divisi, atau periode..."
                  value={unpaidSearch}
                  onChange={(e) => setUnpaidSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant/20 bg-background text-xs font-medium text-primary focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setUnpaidStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    unpaidStatusFilter === "ALL" ? "bg-background text-primary shadow-xs" : "text-on-surface-variant/60"
                  }`}
                >
                  Semua ({unpaidRecords.length})
                </button>
                <button
                  onClick={() => setUnpaidStatusFilter("BELUM_BAYAR")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    unpaidStatusFilter === "BELUM_BAYAR" ? "bg-background text-rose-600 shadow-xs" : "text-on-surface-variant/60"
                  }`}
                >
                  Belum Bayar ({unpaidSummary.totalBelumBayar})
                </button>
                <button
                  onClick={() => setUnpaidStatusFilter("LUNAS")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    unpaidStatusFilter === "LUNAS" ? "bg-background text-emerald-600 shadow-xs" : "text-on-surface-variant/60"
                  }`}
                >
                  Lunas ({unpaidSummary.totalLunas})
                </button>
              </div>
            </div>
          </div>

          {/* Unpaid Table */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs font-bold text-on-surface-variant/60">
                Memuat data anggota belum bayar kas...
              </div>
            ) : filteredUnpaid.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Icon name="check_circle" size="lg" className="text-emerald-500/40" />
                <p className="text-xs font-bold text-on-surface-variant/60">
                  Tidak ada data anggota belum bayar kas. Silakan upload Excel atau tambah manual.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline-variant/15 text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70">
                      <th className="p-4">No</th>
                      <th className="p-4">Nama Anggota</th>
                      <th className="p-4">NPM</th>
                      <th className="p-4">Divisi</th>
                      <th className="p-4">Periode</th>
                      <th className="p-4 text-right">Jumlah Tunggakan</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Aksi Status</th>
                      <th className="p-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-medium">
                    {filteredUnpaid.map((r, idx) => {
                      const isLunas = r.status === "LUNAS";
                      return (
                        <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4 font-bold text-on-surface-variant/50">{idx + 1}</td>
                          <td className="p-4 font-bold text-primary">{r.member_name}</td>
                          <td className="p-4 text-on-surface-variant">{r.npm || "-"}</td>
                          <td className="p-4 text-on-surface-variant">{r.division || "-"}</td>
                          <td className="p-4 font-bold text-secondary">{r.period}</td>
                          <td className="p-4 text-right font-black text-rose-600 whitespace-nowrap">
                            {formatRupiah(r.amount)}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                                isLunas
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              }`}
                            >
                              <Icon name={isLunas ? "check_circle" : "pending"} size="sm" className="!text-[12px]" />
                              {isLunas ? "LUNAS" : "BELUM BAYAR"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(r)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 mx-auto ${
                                isLunas
                                  ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              }`}
                            >
                              <Icon name={isLunas ? "undo" : "check"} size="sm" />
                              <span>{isLunas ? "Ubah Belum Bayar" : "Tandai Lunas"}</span>
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteUnpaid(r.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Hapus Data Tunggakan"
                            >
                              <Icon name="delete" size="sm" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Manual Form - Log Transaksi */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">Tambah Transaksi Kas</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-on-surface-variant/40 hover:text-primary"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">Keterangan Transaksi</label>
                <input
                  type="text"
                  placeholder="Misal: Uang Kas Bulan Januari"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">Tipe Transaksi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "IN" | "OUT" })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                  >
                    <option value="IN">Masuk (IN)</option>
                    <option value="OUT">Keluar (OUT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">Nominal (Rp)</label>
                  <input
                    type="number"
                    placeholder="20000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">Kategori</label>
                <input
                  type="text"
                  placeholder="Kas Anggota, Peralatan, dll"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowManualModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Manual Form - Unpaid Kas */}
      {showUnpaidModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">Tambah Anggota Belum Bayar</h3>
              <button
                onClick={() => setShowUnpaidModal(false)}
                className="text-on-surface-variant/40 hover:text-primary"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleUnpaidSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">
                  Nama Anggota <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama anggota..."
                  value={unpaidFormData.member_name}
                  onChange={(e) => setUnpaidFormData({ ...unpaidFormData, member_name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">NPM</label>
                  <input
                    type="text"
                    placeholder="2226250001"
                    value={unpaidFormData.npm}
                    onChange={(e) => setUnpaidFormData({ ...unpaidFormData, npm: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">Divisi</label>
                  <input
                    type="text"
                    placeholder="Broadcasting, Tim Kreatif"
                    value={unpaidFormData.division}
                    onChange={(e) => setUnpaidFormData({ ...unpaidFormData, division: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">
                    Periode / Bulan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Januari 2026"
                    value={unpaidFormData.period}
                    onChange={(e) => setUnpaidFormData({ ...unpaidFormData, period: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">Jumlah Tunggakan (Rp)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={unpaidFormData.amount}
                    onChange={(e) => setUnpaidFormData({ ...unpaidFormData, amount: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">Status Awal</label>
                <select
                  value={unpaidFormData.status}
                  onChange={(e) =>
                    setUnpaidFormData({
                      ...unpaidFormData,
                      status: e.target.value as "BELUM_BAYAR" | "LUNAS",
                    })
                  }
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                >
                  <option value="BELUM_BAYAR">BELUM BAYAR</option>
                  <option value="LUNAS">LUNAS</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowUnpaidModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Anggota"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
