"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import ActionMenu from "@/components/ui/ActionMenu"
import ConfirmModal from "@/components/ui/ConfirmModal"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { toast } from "@/stores/toast.store"
import { wawancaraService, InterviewQuestion, InterviewResponseLog } from "@/services/wawancara.service"
import { exportToExcel } from "@/lib/excel"
import { exportToPDF } from "@/lib/pdf"
import { useRecruitmentPeriods } from "@/hooks/useRecruitmentPeriods"

export default function WawancaraLogPage() {
  const router = useRouter()
  const { periods, activePeriod } = useRecruitmentPeriods()
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026/2027")
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [responses, setResponses] = useState<InterviewResponseLog[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [search, setSearch] = useState("")
  const [interviewerFilter, setInterviewerFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
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

  // Unique interviewer list for filtering
  const interviewerList = useMemo(() => {
    const set = new Set<string>()
    responses.forEach((r) => {
      if (r.interviewer_name) set.add(r.interviewer_name)
    })
    return Array.from(set)
  }, [responses])

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

  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const s = search.toLowerCase()
      const matchesSearch = !s || r.candidate_name.toLowerCase().includes(s) || (r.interviewer_name && r.interviewer_name.toLowerCase().includes(s))
      const matchesInterviewer = interviewerFilter === "all" || r.interviewer_name === interviewerFilter
      return matchesSearch && matchesInterviewer
    })
  }, [responses, search, interviewerFilter])

  const totalAnsweredCount = useMemo(() => {
    return responses.reduce((acc, r) => acc + r.answers.length, 0)
  }, [responses])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────── */}
        <AdminPageHeader
          breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Wawancara", href: "/admin/wawancara" }, { label: "Log Dokumentasi" }]}
          icon="folder_shared"
          title="Log Wawancara"
          description={`Arsip hasil wawancara • ${selectedPeriod}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={responses.length === 0} startIcon={<Icon name="download" size="sm" />}>
                Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={responses.length === 0} startIcon={<Icon name="picture_as_pdf" size="sm" />}>
                Export PDF
              </Button>
              <Link href="/admin/wawancara/jawaban">
                <Button variant="primary" size="sm" startIcon={<Icon name="edit_note" size="sm" />}>
                  Isi Jawaban Baru
                </Button>
              </Link>
            </div>
          }
        >
          {/* Period Selector Tabs placed below header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/50">Pilih Periode:</span>
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
          </div>
        </AdminPageHeader>

        {/* ── Stats Metric Cards Grid ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 sm:p-5 rounded-3xl border bg-surface-container-low border-outline-variant/15">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Icon name="groups" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">Terwawancara</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-display">{responses.length}</div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
                <Icon name="quiz" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-700">Daftar Soal</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 font-display">{questions.length}</div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                <Icon name="check_circle" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-emerald-700">Jawaban Terisi</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">{totalAnsweredCount}</div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border bg-secondary/5 border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-secondary/15 text-secondary">
                <Icon name="record_voice_over" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-secondary">Pewawancara</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-display">{interviewerList.length}</div>
          </div>
        </div>

        {/* ── Toolbar: Search, Filter & View Mode Switcher ────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <Icon name="search" size="sm" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama calon anggota atau pewawancara..." className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-xs focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/40" />
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* Filter Pewawancara Menu */}
            <ActionMenu
              triggerIcon="filter_list"
              title="Saring Pewawancara"
              actions={[
                {
                  label: "Semua Pewawancara",
                  icon: "list",
                  active: interviewerFilter === "all",
                  onClick: () => setInterviewerFilter("all"),
                },
                ...interviewerList.map((name) => ({
                  label: name,
                  icon: "person",
                  active: interviewerFilter === name,
                  onClick: () => setInterviewerFilter(name),
                })),
              ]}
            />

            {/* View Mode Switcher */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-2xl border border-outline-variant/15 shadow-2xs">
              <button type="button" onClick={() => setViewMode("table")} className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === "table" ? "bg-secondary text-white shadow-xs" : "text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high"}`} title="Tampilan Tabel">
                <Icon name="table_rows" size="sm" />
              </button>
              <button type="button" onClick={() => setViewMode("grid")} className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-secondary text-white shadow-xs" : "text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high"}`} title="Tampilan Kartu">
                <Icon name="grid_view" size="sm" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Data View ──────────────────────────────────── */}
        {isLoading ? (
          <div className="p-16 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/15 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            <p className="text-xs text-on-surface-variant/60 font-semibold">Memuat log dokumentasi wawancara...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <EmptyState icon="folder_shared" title="Belum Ada Log Dokumentasi" description={`Belum ada arsip jawaban wawancara untuk periode ${selectedPeriod}. Mulai pengisian form wawancara untuk merekam hasil penilaian calon anggota.`} actionText="Mulai Pengisian Jawaban" actionIcon="edit_note" onAction={() => router.push("/admin/wawancara/jawaban")} />
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 overflow-hidden shadow-xs">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-xs text-on-surface-variant">
                <thead className="bg-surface-container-low/50 text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70 border-b border-outline-variant/15">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 font-bold text-primary">Nama Calon Anggota</th>
                    <th className="py-3.5 px-4 font-bold">Pewawancara</th>
                    <th className="py-3.5 px-4 font-bold">Tanggal Wawancara</th>
                    <th className="py-3.5 px-4 font-bold text-center">Jawaban Terisi</th>
                    <th className="py-3.5 px-4 font-bold">Catatan</th>
                    <th className="py-3.5 px-4 text-right font-bold w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredResponses.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-on-surface-variant/50">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-primary text-xs sm:text-sm">{r.candidate_name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-primary">{r.interviewer_name || "Admin"}</td>
                      <td className="py-3.5 px-4 font-medium">
                        {new Date(r.interview_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="default" size="sm">
                          {r.answers.length} Jawaban
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-on-surface-variant/70">{r.notes || "-"}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setSelectedResponseDetail(r)} className="p-1.5 text-on-surface-variant/60 hover:text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer" title="Lihat Detail">
                            <Icon name="visibility" size="sm" />
                          </button>
                          <button type="button" onClick={() => setDeleteTargetResponse(r)} className="p-1.5 text-on-surface-variant/60 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Hapus Log">
                            <Icon name="delete" size="sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid Card View */
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedResponseDetail(resItem)} startIcon={<Icon name="visibility" size="sm" />}>
                    Lihat Detail
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
