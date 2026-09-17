"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/ui/ConfirmModal"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { toast } from "@/stores/toast.store"
import { wawancaraService, InterviewQuestion, InterviewResponseLog } from "@/services/wawancara.service"
import { exportToExcel } from "@/lib/excel"
import { exportToPDF } from "@/lib/pdf"
import { periodToYear, useRecruitmentPeriods } from "@/hooks/useRecruitmentPeriods"

export default function WawancaraLogPage() {
  const { periods, activePeriod } = useRecruitmentPeriods()
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026/2027")
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [responses, setResponses] = useState<InterviewResponseLog[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [search, setSearch] = useState("")
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<InterviewResponseLog | null>(null)
  const [deleteTargetResponse, setDeleteTargetResponse] = useState<InterviewResponseLog | null>(null)

  const loadLogs = async (period: string) => {
    setIsLoading(true)
    try {
      const [qRes, rRes] = await Promise.all([wawancaraService.getQuestions(period), wawancaraService.getResponses(period)])
      if (qRes.success) setQuestions(qRes.data)
      if (rRes.success) setResponses(rRes.data)
    } catch (err) {
      console.error("Gagal memuat log wawancara:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(selectedPeriod)
  }, [selectedPeriod])

  useEffect(() => {
    if (activePeriod) setSelectedPeriod(activePeriod)
  }, [activePeriod])

  const handleDeleteResponseConfirm = async () => {
    if (!deleteTargetResponse) return
    try {
      await wawancaraService.deleteResponse(deleteTargetResponse.id)
      toast.success("Log hasil wawancara berhasil dihapus.")
      await loadLogs(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menghapus log wawancara.")
    } finally {
      setDeleteTargetResponse(null)
    }
  }

  // Export Excel
  const handleExportExcel = () => {
    if (responses.length === 0) {
      toast.warning("Belum ada data dokumentasi wawancara untuk diexport.")
      return
    }

    const baseCols = [
      { key: "no", header: "No" },
      { key: "nama", header: "Nama Anggota" },
      { key: "pewawancara", header: "Pewawancara" },
      { key: "tanggal", header: "Tanggal Wawancara" },
    ]

    const qCols = questions.map((q, idx) => ({
      key: `q_${q.id}`,
      header: `P${idx + 1}: ${q.question_text.slice(0, 35)}...`,
    }))

    const cols = [...baseCols, ...qCols, { key: "notes", header: "Catatan Pewawancara" }]

    const exportRows = responses.map((r, i) => {
      const rowObj: any = {
        no: i + 1,
        nama: r.candidate_name,
        pewawancara: r.interviewer_name || "-",
        tanggal: new Date(r.interview_date).toLocaleDateString("id-ID"),
        notes: r.notes || "-",
      }

      questions.forEach((q) => {
        const found = r.answers.find((a) => a.question_id === q.id || a.question_text === q.question_text)
        rowObj[`q_${q.id}`] = found ? found.answer_text : "-"
      })

      return rowObj
    })

    exportToExcel(exportRows, cols, `Dokumentasi_Wawancara_${selectedPeriod.replace(/[^a-zA-Z0-9]/g, "_")}_MDPTV`, `Wawancara ${selectedPeriod}`)
    toast.success("Dokumen Excel berhasil diekspor.")
  }

  // Export PDF
  const handleExportPDF = () => {
    if (responses.length === 0) {
      toast.warning("Belum ada data dokumentasi wawancara untuk diexport.")
      return
    }

    const headers = ["No", "Nama Anggota", "Pewawancara", "Tanggal", "Jawaban Ringkas"]
    const rows = responses.map((r, i) => {
      const summaryAnswer = r.answers
        .slice(0, 3)
        .map((a, idx) => `P${idx + 1}: ${a.answer_text}`)
        .join(" | ")

      return [(i + 1).toString(), r.candidate_name, r.interviewer_name || "-", new Date(r.interview_date).toLocaleDateString("id-ID"), summaryAnswer]
    })

    exportToPDF({
      title: `Dokumentasi Hasil Wawancara Anggota - Periode ${selectedPeriod}`,
      subtitle: `Total Peserta Terwawancara: ${responses.length} anggota`,
      headers,
      rows,
      filename: `Dokumentasi_Wawancara_${selectedPeriod.replace(/[^a-zA-Z0-9]/g, "_")}`,
      summaryRows: [
        { label: "Periode Log Wawancara", value: `Periode ${selectedPeriod}` },
        { label: "Jumlah Soal Wawancara", value: `${questions.length} Soal` },
        { label: "Total Anggota Diwawancarai", value: `${responses.length} Orang` },
      ],
    })
    toast.success("Dokumen PDF berhasil diekspor.")
  }

  const filteredResponses = responses.filter((r) => {
    const s = search.toLowerCase()
    return !s || r.candidate_name.toLowerCase().includes(s) || (r.interviewer_name && r.interviewer_name.toLowerCase().includes(s))
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────── */}
        <AdminPageHeader
          breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Wawancara", href: "/admin/wawancara" }, { label: "Log Dokumentasi" }]}
          icon="folder_shared"
          title="Log Dokumentasi Wawancara"
          description={`Arsip & dokumentasi lengkap hasil penilaian wawancara calon anggota (Periode: Tahun ${selectedPeriod}).`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {/* Period Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/15 overflow-x-auto text-xs font-bold">
                {periods.map((p) => {
                  const isSelected = selectedPeriod === p
                  return (
                    <button key={p} type="button" onClick={() => setSelectedPeriod(p)} className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${isSelected ? "bg-secondary text-white shadow-xs shadow-secondary/20" : "text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-highest"}`}>
                      {p}
                    </button>
                  )
                })}
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
          }
        />

        {/* Toolbar: Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/15">
          <div className="relative w-full sm:w-80">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama anggota / pewawancara..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/20 bg-background text-xs text-primary focus:outline-none focus:border-secondary" />
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
            <p className="font-semibold text-primary">Belum ada log dokumentasi wawancara untuk periode {selectedPeriod}.</p>
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
              <div key={resItem.id} className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-5 shadow-xs hover:border-secondary/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary font-bold text-sm flex items-center justify-center">{idx + 1}</div>
                      <div>
                        <h4 className="text-sm font-bold text-primary">{resItem.candidate_name}</h4>
                        <p className="text-[11px] text-on-surface-variant/70">Pewawancara: {resItem.interviewer_name || "Admin"}</p>
                      </div>
                    </div>
                    <button onClick={() => setDeleteTargetResponse(resItem)} className="p-1.5 text-on-surface-variant/40 hover:text-rose-500 rounded-lg cursor-pointer" title="Hapus Log">
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
                  <span className="text-[10px] text-on-surface-variant/60 font-medium">{resItem.answers.length} Pertanyaan Terjawab</span>
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
        <Modal
          isOpen={Boolean(selectedResponseDetail)}
          onClose={() => setSelectedResponseDetail(null)}
          size="xl"
          title="Detail Hasil Wawancara Anggota"
          description={selectedResponseDetail ? `Kandidat: ${selectedResponseDetail.candidate_name} • Pewawancara: ${selectedResponseDetail.interviewer_name || "Admin"}` : ""}
          headerIcon="assignment_turned_in"
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedResponseDetail(null)}>
              Tutup Detail
            </Button>
          }
        >
          {selectedResponseDetail && (
            <div className="space-y-4">
              {selectedResponseDetail.answers.map((ans, idx) => (
                <div key={idx} className="p-4 bg-surface-container-low/60 rounded-2xl border border-outline-variant/15 space-y-2">
                  <p className="font-bold text-secondary text-xs sm:text-sm">
                    {idx + 1}. {ans.question_text}
                  </p>
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10 text-primary font-medium text-xs leading-relaxed">{ans.answer_text}</div>
                </div>
              ))}

              {selectedResponseDetail.notes && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-2xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Icon name="notes" size="xs" />
                    <span>Catatan Khusus Pewawancara:</span>
                  </p>
                  <p className="leading-relaxed">{selectedResponseDetail.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Response Confirmation Modal */}
        <ConfirmModal isOpen={Boolean(deleteTargetResponse)} onClose={() => setDeleteTargetResponse(null)} onConfirm={handleDeleteResponseConfirm} title="Hapus Log Wawancara" message={`Apakah Anda yakin ingin menghapus log hasil wawancara untuk kandidat "${deleteTargetResponse?.candidate_name}"?`} confirmText="Hapus Log" variant="danger" />
      </div>
    </div>
  )
}
