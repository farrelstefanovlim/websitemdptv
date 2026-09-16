"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  wawancaraService,
  InterviewQuestion,
  InterviewResponseLog,
} from "@/services/wawancara.service";
import { exportToExcel } from "@/lib/excel";
import { exportToPDF } from "@/lib/pdf";

export default function WawancaraLogPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2027]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [responses, setResponses] = useState<InterviewResponseLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<InterviewResponseLog | null>(null);

  const loadLogs = async (year: number) => {
    setIsLoading(true);
    try {
      const [yearsRes, qRes, rRes] = await Promise.all([
        wawancaraService.getYears(),
        wawancaraService.getQuestions(year),
        wawancaraService.getResponses(year),
      ]);

      if (yearsRes.success && yearsRes.data.length > 0) {
        setAvailableYears(yearsRes.data);
      }
      if (qRes.success) setQuestions(qRes.data);
      if (rRes.success) setResponses(rRes.data);
    } catch (err) {
      console.error("Gagal memuat log wawancara:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(selectedYear);
  }, [selectedYear]);

  const handleAddYearPeriod = async () => {
    const nextYearInput = prompt(
      "Masukkan Tahun Log Wawancara Baru (misal: 2025, 2028, 2029):",
      (selectedYear + 1).toString()
    );
    if (!nextYearInput) return;
    const parsed = parseInt(nextYearInput);
    if (isNaN(parsed) || parsed < 2000 || parsed > 2100) {
      alert("Tahun tidak valid.");
      return;
    }
    try {
      await wawancaraService.createYear(parsed);
      setSelectedYear(parsed);
      await loadLogs(parsed);
    } catch (err) {
      alert("Gagal membuat periode tahun baru.");
    }
  };

  const handleDeleteYearPeriod = async (year: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        `⚠️ PERINGATAN: Menghapus Log Tahun ${year} akan menghapus SELURUH pertanyaan dan jawaban wawancara pada tahun tersebut. Lanjutkan?`
      )
    )
      return;

    try {
      await wawancaraService.deleteYear(year);
      const remaining = availableYears.filter((y) => y !== year);
      const nextYear = remaining.length > 0 ? remaining[0] : new Date().getFullYear();
      setSelectedYear(nextYear);
      await loadLogs(nextYear);
    } catch (err) {
      alert("Gagal menghapus periode tahun.");
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus log wawancara ini?")) return;
    try {
      await wawancaraService.deleteResponse(id);
      await loadLogs(selectedYear);
    } catch (err) {
      alert("Gagal menghapus log wawancara.");
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (responses.length === 0) {
      alert("Belum ada data dokumentasi wawancara untuk diexport.");
      return;
    }

    const baseCols = [
      { key: "no", header: "No" },
      { key: "nama", header: "Nama Anggota" },
      { key: "pewawancara", header: "Pewawancara" },
      { key: "tanggal", header: "Tanggal Wawancara" },
    ];

    const qCols = questions.map((q, idx) => ({
      key: `q_${q.id}`,
      header: `P${idx + 1}: ${q.question_text.slice(0, 35)}...`,
    }));

    const cols = [...baseCols, ...qCols, { key: "notes", header: "Catatan Pewawancara" }];

    const exportRows = responses.map((r, i) => {
      const rowObj: any = {
        no: i + 1,
        nama: r.candidate_name,
        pewawancara: r.interviewer_name || "-",
        tanggal: new Date(r.interview_date).toLocaleDateString("id-ID"),
        notes: r.notes || "-",
      };

      questions.forEach((q) => {
        const found = r.answers.find((a) => a.question_id === q.id || a.question_text === q.question_text);
        rowObj[`q_${q.id}`] = found ? found.answer_text : "-";
      });

      return rowObj;
    });

    exportToExcel(
      exportRows,
      cols,
      `Dokumentasi_Wawancara_${selectedYear}_MDPTV`,
      `Wawancara ${selectedYear}`
    );
  };

  // Export PDF
  const handleExportPDF = () => {
    if (responses.length === 0) {
      alert("Belum ada data dokumentasi wawancara untuk diexport.");
      return;
    }

    const headers = ["No", "Nama Anggota", "Pewawancara", "Tanggal", "Jawaban Ringkas"];
    const rows = responses.map((r, i) => {
      const summaryAnswer = r.answers
        .slice(0, 3)
        .map((a, idx) => `P${idx + 1}: ${a.answer_text}`)
        .join(" | ");

      return [
        i + 1,
        r.candidate_name,
        r.interviewer_name || "-",
        new Date(r.interview_date).toLocaleDateString("id-ID"),
        summaryAnswer,
      ];
    });

    exportToPDF({
      title: `Dokumentasi Log Wawancara Anggota Baru - ${selectedYear}`,
      subtitle: `Total Peserta Terwawancara: ${responses.length} anggota`,
      headers,
      rows,
      filename: `Laporan_Wawancara_${selectedYear}_MDPTV`,
      summaryRows: [
        { label: "Periode Log Wawancara", value: `Tahun ${selectedYear}` },
        { label: "Jumlah Soal Wawancara", value: `${questions.length} Soal` },
        { label: "Total Anggota Diwawancarai", value: `${responses.length} Orang` },
      ],
    });
  };

  const filteredResponses = responses.filter((r) => {
    const s = search.toLowerCase();
    return (
      !s ||
      r.candidate_name.toLowerCase().includes(s) ||
      (r.interviewer_name && r.interviewer_name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primary font-display flex items-center gap-2">
            <Icon name="folder_shared" className="text-secondary" />
            Log Dokumentasi Wawancara ({selectedYear})
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Arsip & dokumentasi lengkap hasil wawancara anggota per tahun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector & CRUD Bar */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/15 text-xs font-bold">
            {availableYears.map((yr) => {
              const isSelected = selectedYear === yr;
              return (
                <div
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-secondary text-white shadow-sm"
                      : "text-on-surface-variant/70 hover:text-primary hover:bg-background"
                  }`}
                >
                  <span>Log {yr}</span>
                  {availableYears.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteYearPeriod(yr, e)}
                      title={`Hapus Log Tahun ${yr}`}
                      className={`p-0.5 rounded-md hover:bg-black/20 ${
                        isSelected ? "text-white/80 hover:text-white" : "text-on-surface-variant/40 hover:text-rose-500"
                      }`}
                    >
                      <Icon name="close" size="sm" className="!text-[12px]" />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleAddYearPeriod}
              title="Tambah Periode Tahun Log Baru"
              className="px-2.5 py-1.5 rounded-xl text-secondary hover:bg-secondary/10 flex items-center gap-1 font-bold"
            >
              <Icon name="add" size="sm" />
              <span>Tambah Log</span>
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={responses.length === 0}>
            <Icon name="download" size="sm" className="text-emerald-500" />
            <span>Export Excel</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={responses.length === 0}>
            <Icon name="picture_as_pdf" size="sm" className="text-rose-500" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Toolbar: Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/15">
        <div className="relative w-full sm:w-80">
          <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota / pewawancara..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/20 bg-background text-xs text-primary focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">
            Menampilkan <b>{filteredResponses.length}</b> dari {responses.length} log
          </span>
          <Link href="/admin/wawancara/jawaban">
            <Button variant="primary" size="sm">
              <Icon name="add" size="sm" />
              <span>+ Isi Jawaban Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Log Response Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-on-surface-variant">Memuat log dokumentasi...</div>
      ) : filteredResponses.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/15 text-xs text-on-surface-variant flex flex-col items-center gap-3">
          <Icon name="folder_off" size="lg" className="text-on-surface-variant/30" />
          <p className="font-semibold text-primary">Belum ada log dokumentasi wawancara untuk tahun {selectedYear}.</p>
          <Link href="/admin/wawancara/jawaban">
            <Button variant="primary" size="sm">
              <Icon name="edit_note" size="sm" />
              <span>Mulai Pengisian Jawaban Wawancara</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResponses.map((resItem, idx) => (
            <div
              key={resItem.id}
              className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-5 shadow-xs hover:border-secondary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary font-bold text-sm flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{resItem.candidate_name}</h4>
                      <p className="text-[11px] text-on-surface-variant/70">
                        Pewawancara: {resItem.interviewer_name || "Admin"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteResponse(resItem.id)}
                    className="p-1.5 text-on-surface-variant/40 hover:text-rose-500 rounded-lg"
                    title="Hapus Log"
                  >
                    <Icon name="delete" size="sm" />
                  </button>
                </div>

                <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl flex justify-between">
                  <span>Tanggal Wawancara:</span>
                  <span className="font-bold text-primary">
                    {new Date(resItem.interview_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Preview first 2 answers */}
                <div className="space-y-2 text-xs">
                  {resItem.answers.slice(0, 2).map((ans, aIdx) => (
                    <div key={aIdx} className="bg-background p-2.5 rounded-xl border border-outline-variant/10">
                      <p className="text-[10px] text-on-surface-variant/60 font-bold">P: {ans.question_text}</p>
                      <p className="text-xs font-semibold text-primary mt-0.5 line-clamp-2">J: {ans.answer_text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
                <span className="text-[10px] text-on-surface-variant/60 font-medium">
                  {resItem.answers.length} Pertanyaan Terjawab
                </span>
                <Button variant="outline" size="sm" onClick={() => setSelectedResponseDetail(resItem)}>
                  <Icon name="visibility" size="sm" />
                  <span>Lihat Detail</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Q&A Result */}
      {selectedResponseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <div>
                <h3 className="text-base font-bold text-primary">Detail Hasil Wawancara Anggota</h3>
                <p className="text-xs text-on-surface-variant">
                  Nama: <b>{selectedResponseDetail.candidate_name}</b> | Pewawancara: {selectedResponseDetail.interviewer_name || "Admin"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedResponseDetail(null)}>
                <Icon name="close" size="sm" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              {selectedResponseDetail.answers.map((ans, idx) => (
                <div key={idx} className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/15 space-y-1">
                  <p className="font-bold text-secondary">
                    {idx + 1}. {ans.question_text}
                  </p>
                  <p className="p-2.5 rounded-xl bg-background border border-outline-variant/10 text-primary font-medium">
                    {ans.answer_text}
                  </p>
                </div>
              ))}

              {selectedResponseDetail.notes && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-2xl">
                  <p className="font-bold">Catatan Pewawancara:</p>
                  <p className="mt-0.5">{selectedResponseDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-outline-variant/15">
              <Button variant="primary" size="sm" onClick={() => setSelectedResponseDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
