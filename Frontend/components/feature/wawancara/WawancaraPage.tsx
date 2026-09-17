"use client"

import { useState, useEffect } from "react"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/ui/ConfirmModal"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { toast } from "@/stores/toast.store"
import { wawancaraService, InterviewQuestion, InterviewResponseLog } from "@/services/wawancara.service"
import { recruitmentService } from "@/services/recruitment.service"
import type { Applicant } from "@/components/feature/recruitment/types/recruitment.type"
import { exportToExcel } from "@/lib/excel"
import { exportToPDF } from "@/lib/pdf"
import { periodToYear, useRecruitmentPeriods } from "@/hooks/useRecruitmentPeriods"

export default function WawancaraPage() {
  const { periods, activePeriod } = useRecruitmentPeriods()
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026/2027")
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [responses, setResponses] = useState<InterviewResponseLog[]>([])
  const [interviewCandidates, setInterviewCandidates] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<"INTERVIEW_FORM" | "DOCUMENTATION">("INTERVIEW_FORM")

  // Form Jawab Wawancara State
  const [candidateName, setCandidateName] = useState("")
  const [interviewerName, setInterviewerName] = useState("Admin Pewawancara")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [interviewNotes, setInterviewNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CRUD Pertanyaan Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [deleteTargetQuestion, setDeleteTargetQuestion] = useState<InterviewQuestion | null>(null)
  const [deleteTargetResponse, setDeleteTargetResponse] = useState<InterviewResponseLog | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "ESSAY">("ESSAY")
  const [optionList, setOptionList] = useState<string[]>(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"])

  // Detail Modal Log Wawancara State
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<InterviewResponseLog | null>(null)

  // Load data untuk periode terpilih
  const loadData = async (period: string) => {
    setIsLoading(true)
    try {
      const [qRes, rRes, appRes] = await Promise.all([wawancaraService.getQuestions(period), wawancaraService.getResponses(period), recruitmentService.fetchApplicants({ status: "interview", period }).catch(() => ({ applicants: [] }))])

      if (qRes.success) {
        setQuestions(qRes.data)
      }
      if (rRes.success) {
        setResponses(rRes.data)
      }
      if (appRes && appRes.applicants) {
        setInterviewCandidates(appRes.applicants)
      }
    } catch (err) {
      console.error("Gagal memuat data wawancara:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(selectedPeriod)
  }, [selectedPeriod])

  useEffect(() => {
    if (activePeriod) setSelectedPeriod(activePeriod)
  }, [activePeriod])

  // Handle Input Jawaban
  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }))
  }

  // Submit Jawaban Wawancara Anggota
  const handleSubmitInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidateName.trim()) {
      toast.error("Mohon isi Nama Anggota yang diwawancarai.")
      return
    }

    if (questions.length === 0) {
      toast.warning("Belum ada pertanyaan wawancara untuk periode ini. Silakan buat pertanyaan terlebih dahulu.")
      return
    }

    const payloadAnswers = questions.map((q) => ({
      question_id: q.id,
      question_text: q.question_text,
      type: q.type,
      answer_text: answers[q.id] || "-",
    }))

    setIsSubmitting(true)
    try {
      await wawancaraService.submitResponse({
        year_period: selectedPeriod,
        period: selectedPeriod,
        candidate_name: candidateName.trim(),
        interviewer_name: interviewerName.trim(),
        answers: payloadAnswers,
        notes: interviewNotes,
      })

      toast.success(`Berhasil menyimpan wawancara untuk anggota "${candidateName}"!`)
      // Reset form agar bisa tambah jawaban anggota baru berikutnya
      setCandidateName("")
      setAnswers({})
      setInterviewNotes("")
      await loadData(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menyimpan data wawancara.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Simpan / Edit Pertanyaan (CRUD)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) {
      toast.error("Mohon isi teks pertanyaan.")
      return
    }

    try {
      const validOptions = questionType === "MULTIPLE_CHOICE" ? optionList.filter((o) => o.trim() !== "") : []

      if (editingQuestion) {
        await wawancaraService.updateQuestion(editingQuestion.id, {
          question_text: questionText.trim(),
          type: questionType,
          options: validOptions,
        })
        toast.success("Pertanyaan wawancara berhasil diperbarui!")
      } else {
        await wawancaraService.createQuestion({
          year_period: selectedPeriod,
          period: selectedPeriod,
          question_text: questionText.trim(),
          type: questionType,
          options: validOptions,
          order: questions.length + 1,
        })
        toast.success("Pertanyaan wawancara baru berhasil ditambahkan!")
      }

      setShowQuestionModal(false)
      setEditingQuestion(null)
      setQuestionText("")
      setQuestionType("ESSAY")
      setOptionList(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"])
      await loadData(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menyimpan pertanyaan.")
    }
  }

  const handleDeleteQuestionConfirm = async () => {
    if (!deleteTargetQuestion) return
    try {
      await wawancaraService.deleteQuestion(deleteTargetQuestion.id)
      toast.success("Pertanyaan berhasil dihapus.")
      await loadData(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menghapus pertanyaan.")
    } finally {
      setDeleteTargetQuestion(null)
    }
  }

  const handleDeleteResponseConfirm = async () => {
    if (!deleteTargetResponse) return
    try {
      await wawancaraService.deleteResponse(deleteTargetResponse.id)
      toast.success("Log wawancara berhasil dihapus.")
      await loadData(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menghapus log wawancara.")
    } finally {
      setDeleteTargetResponse(null)
    }
  }

  // Export Excel Rekap Wawancara per Periode
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

    // Buat kolom untuk setiap pertanyaan
    const qCols = questions.map((q, idx) => ({
      key: `q_${q.id}`,
      header: `P${idx + 1}: ${q.question_text.slice(0, 30)}...`,
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

  // Export PDF Rekap Wawancara per Periode
  const handleExportPDF = () => {
    if (responses.length === 0) {
      toast.warning("Belum ada data dokumentasi wawancara untuk diexport.")
      return
    }

    const headers = ["No", "Nama Anggota", "Pewawancara", "Tanggal", "Jawaban Utama / Ringkasan"]
    const rows = responses.map((r, i) => {
      const summaryAnswer = r.answers
        .slice(0, 3)
        .map((a, idx) => `P${idx + 1}: ${a.answer_text}`)
        .join(" | ")

      return [i + 1, r.candidate_name, r.interviewer_name || "-", new Date(r.interview_date).toLocaleDateString("id-ID"), summaryAnswer]
    })

    exportToPDF({
      title: `Dokumentasi Wawancara Anggota Baru - ${selectedPeriod}`,
      subtitle: `Total Peserta Terwawancara: ${responses.length} anggota`,
      headers,
      rows,
      filename: `Laporan_Wawancara_${selectedPeriod.replace(/[^a-zA-Z0-9]/g, "_")}_MDPTV`,
      summaryRows: [
        { label: "Periode Wawancara", value: `Periode ${selectedPeriod}` },
        { label: "Jumlah Pertanyaan", value: `${questions.length} Pertanyaan` },
        { label: "Total Anggota Diwawancarai", value: `${responses.length} Orang` },
      ],
    })
    toast.success("Dokumen PDF berhasil diekspor.")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────── */}
        <AdminPageHeader
          breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Wawancara" }]}
          icon="quiz"
          title="Wawancara Calon Anggota"
          description={`Kelola pertanyaan wawancara, form penilaian, dan dokumentasi log (Periode: Tahun ${selectedPeriod}).`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant/15 text-xs font-bold">
                {periods.map((p) => (
                  <button key={p} type="button" onClick={() => setSelectedPeriod(p)} className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${selectedPeriod === p ? "bg-secondary text-white shadow-xs shadow-secondary/20" : "text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-highest"}`}>
                    {p}
                  </button>
                ))}
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
        >
          {/* Main View Tabs: Form vs Documentation Log */}
          <div className="flex gap-4 pt-1">
            <button onClick={() => setActiveTab("INTERVIEW_FORM")} className={`pb-2 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "INTERVIEW_FORM" ? "border-secondary text-secondary" : "border-transparent text-on-surface-variant/60 hover:text-primary"}`}>
              <Icon name="assignment" size="sm" />
              <span>Form Pewawancaraan ({selectedPeriod})</span>
            </button>

            <button onClick={() => setActiveTab("DOCUMENTATION")} className={`pb-2 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "DOCUMENTATION" ? "border-secondary text-secondary" : "border-transparent text-on-surface-variant/60 hover:text-primary"}`}>
              <Icon name="folder_shared" size="sm" />
              <span>Dokumentasi & Log ({responses.length} Anggota)</span>
            </button>
          </div>
        </AdminPageHeader>

        {/* TAB 1: FORM PEWAWANCARAAN & MANAJEMEN PERTANYAAN */}
        {activeTab === "INTERVIEW_FORM" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Manage Questions list */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15">
                <div>
                  <h3 className="text-sm font-bold text-primary font-display">Daftar Pertanyaan</h3>
                  <p className="text-[11px] text-on-surface-variant">
                    {questions.length} Soal untuk Periode {selectedPeriod}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(null)
                    setQuestionText("")
                    setQuestionType("ESSAY")
                    setOptionList(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"])
                    setShowQuestionModal(true)
                  }}
                >
                  <Icon name="add" size="sm" />
                  <span>Buat Soal</span>
                </Button>
              </div>

              <div className="space-y-2">
                {questions.length === 0 ? (
                  <div className="p-6 text-center bg-surface-container-low/40 rounded-2xl text-xs text-on-surface-variant border border-dashed border-outline-variant/20">
                    Belum ada pertanyaan wawancara untuk periode {selectedPeriod}. Klik <b>Buat Soal</b> untuk menambahkan pertanyaan.
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingQuestion(q)
                              setQuestionText(q.question_text)
                              setQuestionType(q.type)
                              setOptionList(q.options && q.options.length > 0 ? q.options : ["Opsi 1", "Opsi 2"])
                              setShowQuestionModal(true)
                            }}
                            className="p-1 text-on-surface-variant/60 hover:text-secondary"
                          >
                            <Icon name="edit" size="sm" />
                          </button>
                          <button onClick={() => setDeleteTargetQuestion(q)} className="p-1 text-on-surface-variant/60 hover:text-rose-500 cursor-pointer">
                            <Icon name="delete" size="sm" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-primary">{q.question_text}</p>
                      {q.type === "MULTIPLE_CHOICE" && q.options && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant border border-outline-variant/10">
                              • {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Direct Interview Filling Form (No User Account Required) */}
            <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
              <div className="border-b border-outline-variant/15 pb-4">
                <h3 className="text-base font-bold text-primary font-display flex items-center gap-2">
                  <Icon name="edit_note" className="text-secondary" />
                  Form Pengisian Jawaban Wawancara Anggota
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Isi jawaban wawancara di bawah ini secara langsung. Cukup masukkan <b>Nama Anggota</b> tanpa perlu membuat akun baru.
                </p>
              </div>

              <form onSubmit={handleSubmitInterview} className="space-y-6">
                {/* Candidate Info Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 text-xs">
                  <div>
                    <label className="block font-bold text-primary mb-1">
                      Nama Anggota / Calon Anggota <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" placeholder="Masukkan nama lengkap anggota..." value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant/20 bg-background font-semibold text-primary focus:outline-none focus:border-secondary" required />
                  </div>

                  <div>
                    <label className="block font-bold text-primary mb-1">Nama Pewawancara (Admin/Penguji)</label>
                    <input type="text" placeholder="Nama Anda / Penguji..." value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant/20 bg-background text-primary focus:outline-none focus:border-secondary" />
                  </div>

                  {/* Candidate Quick Dossier & Links Card */}
                  {(() => {
                    const activeCandidate = interviewCandidates.find((c) => c.name.toLowerCase().trim() === candidateName.toLowerCase().trim())
                    if (!activeCandidate) return null
                    return (
                      <div className="sm:col-span-2 p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-primary text-sm font-display">{activeCandidate.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-bold">NPM: {activeCandidate.npm}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-medium">{activeCandidate.division}</span>
                          </div>
                          {activeCandidate.motivation && <p className="text-[11px] text-on-surface-variant/70 italic line-clamp-2">&quot;{activeCandidate.motivation}&quot;</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {activeCandidate.cv_url ? (
                            <a href={activeCandidate.cv_url.startsWith("http") ? activeCandidate.cv_url : `https://${activeCandidate.cv_url}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors border ${activeCandidate.cv_url.toLowerCase().includes(".pdf") ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/20" : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/20"}`} title="Buka CV / Foto Kandidat di Tab Baru">
                              <Icon name={activeCandidate.cv_url.toLowerCase().includes(".pdf") ? "picture_as_pdf" : "image"} size="xs" />
                              <span>{activeCandidate.cv_url.toLowerCase().includes(".pdf") ? "Buka CV (PDF)" : "Buka Foto / CV"}</span>
                              <Icon name="open_in_new" size="xs" className="!text-[10px]" />
                            </a>
                          ) : (
                            <span className="text-[10px] px-2.5 py-1 rounded-xl bg-surface-container-low text-on-surface-variant/40 font-medium">CV/Foto: -</span>
                          )}

                          {activeCandidate.portfolio_url ? (
                            <a href={activeCandidate.portfolio_url.startsWith("http") ? activeCandidate.portfolio_url : `https://${activeCandidate.portfolio_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 font-bold text-xs transition-colors border border-purple-500/20" title="Buka Portofolio Kandidat di Tab Baru">
                              <Icon name="folder_special" size="xs" />
                              <span>Buka Portofolio</span>
                              <Icon name="open_in_new" size="xs" className="!text-[10px]" />
                            </a>
                          ) : (
                            <span className="text-[10px] px-2.5 py-1 rounded-xl bg-surface-container-low text-on-surface-variant/40 font-medium">Portofolio: -</span>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Dynamic Questions & Answer Inputs */}
                <div className="space-y-5">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant/60">Daftar Pertanyaan Wawancara ({selectedPeriod})</h4>

                  {questions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant/70 border border-dashed rounded-2xl">Silakan buat minimal 1 pertanyaan wawancara di kolom sebelah kiri untuk mulai mengisi jawaban.</div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-2xl border border-outline-variant/15 bg-background space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-lg bg-secondary text-white text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-primary">{q.question_text}</p>
                            <span className="text-[10px] text-on-surface-variant/60">Tipe: {q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay / Isian Bebeas"}</span>
                          </div>
                        </div>

                        {/* Input based on type */}
                        {q.type === "MULTIPLE_CHOICE" && q.options ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                            {q.options.map((opt, oIdx) => (
                              <label key={oIdx} className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${answers[q.id] === opt ? "bg-secondary/10 border-secondary text-secondary font-bold shadow-xs" : "border-outline-variant/15 hover:bg-surface-container-low text-primary"}`}>
                                <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} className="accent-secondary" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="pl-8">
                            <textarea rows={3} placeholder="Tuliskan jawaban anggota..." value={answers[q.id] || ""} onChange={(e) => handleAnswerChange(q.id, e.target.value)} className="w-full p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Notes field */}
                <div className="text-xs space-y-1">
                  <label className="block font-bold text-primary">Catatan Tambahan Pewawancara (Opsional)</label>
                  <textarea rows={2} placeholder="Catatan rekomendasi, hasil evaluasi, atau komitmen anggota..." value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary" />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between border-t border-outline-variant/15">
                  <p className="text-xs text-on-surface-variant/60">Setelah disimpan, form akan di-reset otomatis untuk pengisian berikutnya.</p>
                  <Button variant="primary" size="md" type="submit" disabled={isSubmitting || questions.length === 0}>
                    <Icon name="save" size="sm" />
                    <span>Simpan Jawaban Wawancara</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: LOG DOKUMENTASI WAWANCARA PER TAHUN */}
        {activeTab === "DOCUMENTATION" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15">
              <div>
                <h3 className="text-base font-bold text-primary font-display">Dokumentasi Wawancara - Log Periode {selectedPeriod}</h3>
                <p className="text-xs text-on-surface-variant">
                  Total {responses.length} hasil wawancara terdaftar pada periode {selectedPeriod}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <Icon name="download" size="sm" className="text-emerald-500" />
                  <span>Download Rekap Excel</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Icon name="picture_as_pdf" size="sm" className="text-rose-500" />
                  <span>Download Rekap PDF</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-on-surface-variant">Memuat dokumentasi log wawancara...</div>
            ) : responses.length === 0 ? (
              <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/15 text-xs text-on-surface-variant flex flex-col items-center gap-2">
                <Icon name="folder_off" size="lg" className="text-on-surface-variant/30" />
                <p>Belum ada log dokumentasi wawancara untuk periode {selectedPeriod}.</p>
                <p className="text-[11px] text-on-surface-variant/50">
                  Gunakan tab <b>Form Pewawancaraan</b> untuk mulai menguji dan mengisi hasil wawancara anggota.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {responses.map((resItem, idx) => (
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
                        <button onClick={() => setDeleteTargetResponse(resItem)} className="p-1.5 text-on-surface-variant/40 hover:text-rose-500 rounded-lg cursor-pointer">
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
          </div>
        )}

        {/* Modal CRUD Pertanyaan */}
        <Modal
          isOpen={showQuestionModal}
          onClose={() => setShowQuestionModal(false)}
          size="lg"
          title={editingQuestion ? "Edit Pertanyaan Wawancara" : "Buat Pertanyaan Wawancara Baru"}
          description={`Tentukan pertanyaan seleksi untuk periode wawancara ${selectedPeriod}`}
          headerIcon="help_outline"
          footer={
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowQuestionModal(false)}>
                Batal
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveQuestion as any}>
                Simpan Pertanyaan
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <Textarea label="Teks Pertanyaan Wawancara" required rows={3} placeholder="Misal: Apa motivasi utama Anda bergabung dengan UKM MDPTV?" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">Tipe Pertanyaan</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setQuestionType("ESSAY")} className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${questionType === "ESSAY" ? "bg-secondary text-white border-secondary shadow-xs shadow-secondary/20" : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant/70 hover:bg-surface-container-low"}`}>
                  Essay / Isian Bebas
                </button>
                <button type="button" onClick={() => setQuestionType("MULTIPLE_CHOICE")} className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${questionType === "MULTIPLE_CHOICE" ? "bg-secondary text-white border-secondary shadow-xs shadow-secondary/20" : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant/70 hover:bg-surface-container-low"}`}>
                  Pilihan Ganda
                </button>
              </div>
            </div>

            {questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2 bg-surface-container-low/60 p-4 rounded-2xl border border-outline-variant/15">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block">Daftar Pilihan Jawaban</label>
                {optionList.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-on-surface-variant/60 w-4">{oIdx + 1}.</span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const updated = [...optionList]
                        updated[oIdx] = e.target.value
                        setOptionList(updated)
                      }}
                      placeholder={`Pilihan ${oIdx + 1}`}
                      containerClassName="flex-1"
                    />
                    {optionList.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setOptionList(optionList.filter((_, i) => i !== oIdx))} className="text-rose-500 hover:text-rose-700">
                        <Icon name="close" size="sm" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setOptionList([...optionList, `Pilihan ${optionList.length + 1}`])} startIcon={<Icon name="add" size="sm" />}>
                  Tambah Pilihan Jawaban
                </Button>
              </div>
            )}
          </form>
        </Modal>

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

        {/* Delete Question Confirmation Modal */}
        <ConfirmModal isOpen={Boolean(deleteTargetQuestion)} onClose={() => setDeleteTargetQuestion(null)} onConfirm={handleDeleteQuestionConfirm} title="Hapus Pertanyaan Wawancara" message={`Apakah Anda yakin ingin menghapus pertanyaan "${deleteTargetQuestion?.question_text}"?`} confirmText="Hapus Pertanyaan" variant="danger" />

        {/* Delete Response Confirmation Modal */}
        <ConfirmModal isOpen={Boolean(deleteTargetResponse)} onClose={() => setDeleteTargetResponse(null)} onConfirm={handleDeleteResponseConfirm} title="Hapus Log Wawancara" message={`Apakah Anda yakin ingin menghapus log hasil wawancara untuk "${deleteTargetResponse?.candidate_name}"?`} confirmText="Hapus Log" variant="danger" />
      </div>
    </div>
  )
}
