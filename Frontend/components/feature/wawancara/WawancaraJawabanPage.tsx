"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { toast } from "@/stores/toast.store"
import { wawancaraService, InterviewQuestion } from "@/services/wawancara.service"
import { recruitmentService } from "@/services/recruitment.service"
import type { Applicant } from "@/components/feature/recruitment/types/recruitment.type"
import { periodToYear, useRecruitmentPeriods } from "@/hooks/useRecruitmentPeriods"

export default function WawancaraJawabanPage() {
  const { periods, activePeriod } = useRecruitmentPeriods()
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026/2027")
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [interviewCandidates, setInterviewCandidates] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Form State
  const [candidateName, setCandidateName] = useState("")
  const [interviewerName, setInterviewerName] = useState("Admin Pewawancara")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [interviewNotes, setInterviewNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Select2 Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadQuestions = async (period: string) => {
    setIsLoading(true)
    try {
      const qRes = await wawancaraService.getQuestions(period)
      if (qRes.success) {
        setQuestions(qRes.data)
      }
    } catch (err) {
      console.error("Gagal memuat pertanyaan wawancara:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadInterviewCandidates = async (period: string) => {
    try {
      const res = await recruitmentService.fetchApplicants({ status: "interview", period })
      if (res.applicants) {
        setInterviewCandidates(res.applicants)
      }
    } catch (err) {
      console.error("Gagal memuat calon anggota interview:", err)
    }
  }

  useEffect(() => {
    loadQuestions(selectedPeriod)
    loadInterviewCandidates(selectedPeriod)
  }, [selectedPeriod])

  useEffect(() => {
    if (activePeriod) setSelectedPeriod(activePeriod)
  }, [activePeriod])

  // Handle outside click for Select2 dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }))
  }

  const handleSelectCandidate = (candidate: Applicant) => {
    setCandidateName(candidate.name)
    if (!interviewNotes) {
      setInterviewNotes(`NPM: ${candidate.npm} | Divisi: ${candidate.division}`)
    }
    setIsDropdownOpen(false)
  }

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

      toast.success(`Berhasil menyimpan jawaban wawancara untuk "${candidateName}"!`)
      setCandidateName("")
      setAnswers({})
      setInterviewNotes("")
      loadInterviewCandidates(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menyimpan data jawaban wawancara.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter candidates in select2 based on input search
  const filteredCandidates = interviewCandidates.filter((c) => c.name.toLowerCase().includes(candidateName.toLowerCase()) || c.npm.toLowerCase().includes(candidateName.toLowerCase()) || c.division.toLowerCase().includes(candidateName.toLowerCase()))

  const activeCandidate = interviewCandidates.find((c) => c.name.toLowerCase().trim() === candidateName.toLowerCase().trim())

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────── */}
        <AdminPageHeader
          breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Wawancara", href: "/admin/wawancara" }, { label: "Form Jawaban" }]}
          icon="edit_note"
          title="Pengisian Jawaban Wawancara"
          description={`Panggil calon anggota berstatus Interview dan simpan jawaban wawancara (Periode: Tahun ${selectedPeriod}).`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
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

              <Link href="/admin/wawancara/log">
                <Button variant="outline" size="sm">
                  <Icon name="folder_shared" size="sm" />
                  <span>Lihat Log Dokumentasi</span>
                </Button>
              </Link>
            </div>
          }
        />

        {/* Main Form */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-6">
          <form onSubmit={handleSubmitInterview} className="space-y-6">
            {/* Candidate Info Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 text-xs">
              {/* Select2 Searchable Candidate Input */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-primary">
                    Nama Anggota / Calon Anggota <span className="text-rose-500">*</span>
                  </label>
                  {interviewCandidates.length > 0 && <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">{interviewCandidates.length} Siap Interview</span>}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik atau cari nama calon anggota..."
                    value={candidateName}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setCandidateName(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    className="w-full p-3 pr-9 rounded-xl border border-outline-variant/20 bg-background font-bold text-sm text-primary focus:outline-none focus:border-secondary shadow-xs"
                    required
                  />
                  <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary">
                    <Icon name={isDropdownOpen ? "expand_less" : "expand_more"} size="sm" />
                  </button>
                </div>

                {/* Select2 Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/50 border-b border-outline-variant/10 flex justify-between items-center">
                      <span>Daftar Calon Anggota (Status Interview)</span>
                      <span className="text-secondary">{filteredCandidates.length} ditemukan</span>
                    </div>

                    {filteredCandidates.length === 0 ? (
                      <div className="p-4 text-center text-xs text-on-surface-variant/60">{interviewCandidates.length === 0 ? <span>Belum ada calon anggota berstatus &quot;Interview&quot; di Penerimaan.</span> : <span>Tidak menemukan nama yang cocok. Anda dapat melanjutkan mengetik manual.</span>}</div>
                    ) : (
                      filteredCandidates.map((c) => (
                        <div key={c.id} onClick={() => handleSelectCandidate(c)} className="p-3 rounded-xl hover:bg-secondary/10 hover:text-secondary cursor-pointer transition-all flex items-center justify-between group">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-primary group-hover:text-secondary truncate">{c.name}</p>
                            <p className="text-[10px] text-on-surface-variant/60">
                              NPM: {c.npm} | Divisi: {c.division}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20 shrink-0">Interview</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-primary mb-1.5">Nama Pewawancara (Admin/Penguji)</label>
                <input type="text" placeholder="Nama Anda / Penguji..." value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary focus:outline-none focus:border-secondary" />
              </div>

              {/* Candidate Quick Dossier & Links Card */}
              {activeCandidate && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
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
                      <a href={activeCandidate.cv_url.startsWith("http") ? activeCandidate.cv_url : `https://${activeCandidate.cv_url}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors border ${activeCandidate.cv_url.toLowerCase().includes(".pdf") ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/20" : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/20"}`} title="Buka CV / Foto Kandidat di Tab Baru">
                        <Icon name={activeCandidate.cv_url.toLowerCase().includes(".pdf") ? "picture_as_pdf" : "image"} size="xs" />
                        <span>{activeCandidate.cv_url.toLowerCase().includes(".pdf") ? "Buka CV (PDF)" : "Buka Foto / CV"}</span>
                        <Icon name="open_in_new" size="xs" className="!text-[10px]" />
                      </a>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant/40 font-medium">CV/Foto: -</span>
                    )}

                    {activeCandidate.portfolio_url ? (
                      <a href={activeCandidate.portfolio_url.startsWith("http") ? activeCandidate.portfolio_url : `https://${activeCandidate.portfolio_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 font-bold text-xs transition-colors border border-purple-500/20" title="Buka Portofolio Kandidat di Tab Baru">
                        <Icon name="folder_special" size="xs" />
                        <span>Buka Portofolio</span>
                        <Icon name="open_in_new" size="xs" className="!text-[10px]" />
                      </a>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant/40 font-medium">Portofolio: -</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Questions & Answer Inputs */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                <h3 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant/70">
                  Pertanyaan Wawancara Periode {selectedPeriod} ({questions.length} Soal)
                </h3>
                <Link href="/admin/wawancara/pertanyaan" className="text-xs text-secondary hover:underline font-bold">
                  + Ubah / Buat Soal
                </Link>
              </div>

              {isLoading ? (
                <div className="p-8 text-center text-xs text-on-surface-variant">Memuat pertanyaan...</div>
              ) : questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-on-surface-variant/70 border border-dashed rounded-2xl space-y-2">
                  <p className="font-semibold text-primary">Belum ada pertanyaan wawancara untuk periode {selectedPeriod}.</p>
                  <Link href="/admin/wawancara/pertanyaan" className="inline-block text-secondary underline font-bold">
                    Klik di sini untuk membuat pertanyaan wawancara terlebih dahulu.
                  </Link>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-outline-variant/15 bg-background space-y-4 shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-secondary text-white text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-primary">{q.question_text}</p>
                        <span className="text-[10px] text-on-surface-variant/60 uppercase font-semibold tracking-wider">Tipe: {q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay / Isian Bebas"}</span>
                      </div>
                    </div>

                    {/* Input based on type */}
                    {q.type === "MULTIPLE_CHOICE" && q.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:ml-10">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${answers[q.id] === opt ? "bg-secondary/10 border-secondary text-secondary font-bold shadow-xs" : "border-outline-variant/15 hover:bg-surface-container-low text-primary"}`}>
                            <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} className="accent-secondary w-4 h-4" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="sm:ml-10">
                        <textarea rows={3} placeholder="Tuliskan jawaban anggota..." value={answers[q.id] || ""} onChange={(e) => handleAnswerChange(q.id, e.target.value)} className="w-full p-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Notes field */}
            <div className="text-xs space-y-1.5">
              <label className="block font-bold text-primary">Catatan Tambahan Pewawancara (Opsional)</label>
              <textarea rows={2} placeholder="Catatan rekomendasi, hasil evaluasi, atau komitmen anggota..." value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} className="w-full p-3.5 rounded-xl border border-outline-variant/20 bg-background text-primary" />
            </div>

            {/* Submit button */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-outline-variant/15">
              <p className="text-xs text-on-surface-variant/60">Form akan di-reset otomatis setelah simpan agar siap untuk wawancara peserta berikutnya.</p>
              <Button variant="primary" size="md" type="submit" disabled={isSubmitting || questions.length === 0}>
                <Icon name="save" size="sm" />
                <span>Simpan Jawaban Wawancara</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
