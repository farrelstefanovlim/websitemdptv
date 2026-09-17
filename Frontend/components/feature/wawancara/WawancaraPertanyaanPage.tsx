"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/ui/ConfirmModal"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { wawancaraService, InterviewQuestion } from "@/services/wawancara.service"
import { toast } from "@/stores/toast.store"
import { periodToYear, useRecruitmentPeriods } from "@/hooks/useRecruitmentPeriods"

export default function WawancaraPertanyaanPage() {
  const { periods, activePeriod } = useRecruitmentPeriods()
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026/2027")
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Modal CRUD Pertanyaan State
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [deleteTargetQuestion, setDeleteTargetQuestion] = useState<InterviewQuestion | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "ESSAY">("ESSAY")
  const [optionList, setOptionList] = useState<string[]>(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"])

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

  useEffect(() => {
    loadQuestions(selectedPeriod)
  }, [selectedPeriod])

  useEffect(() => {
    if (activePeriod) setSelectedPeriod(activePeriod)
  }, [activePeriod])

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
      await loadQuestions(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menyimpan pertanyaan wawancara.")
    }
  }

  const handleDeleteQuestionConfirm = async () => {
    if (!deleteTargetQuestion) return
    try {
      await wawancaraService.deleteQuestion(deleteTargetQuestion.id)
      toast.success("Pertanyaan berhasil dihapus.")
      await loadQuestions(selectedPeriod)
    } catch (err) {
      toast.error("Gagal menghapus pertanyaan.")
    } finally {
      setDeleteTargetQuestion(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────── */}
        <AdminPageHeader
          breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Wawancara", href: "/admin/wawancara" }, { label: "Pertanyaan" }]}
          icon="help_outline"
          title="Pertanyaan Wawancara"
          description={`Kelola soal pilihan ganda dan essay • ${selectedPeriod}`}
          actions={
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
              startIcon={<Icon name="add" size="sm" />}
            >
              Buat Soal Baru
            </Button>
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

        {/* Main Questions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary font-display">
              Daftar Soal Wawancara Periode {selectedPeriod} ({questions.length} Soal)
            </h2>
            <Link href="/admin/wawancara/jawaban" className="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
              <span>Buka Form Pengisian Jawaban</span>
              <Icon name="arrow_forward" size="sm" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">Memuat daftar pertanyaan...</div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30 text-xs text-on-surface-variant flex flex-col items-center gap-3">
              <Icon name="quiz" size="lg" className="text-on-surface-variant/30" />
              <p className="font-semibold text-primary">Belum ada pertanyaan wawancara untuk periode {selectedPeriod}.</p>
              <p className="text-on-surface-variant/60 max-w-sm">
                Klik tombol <b>Buat Pertanyaan Baru</b> di atas untuk menambahkan soal pilihan ganda atau essay.
              </p>
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
                <span>Buat Pertanyaan Baru</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-5 shadow-xs hover:border-secondary/30 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-secondary text-white text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">{q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"}</span>
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
                          className="p-1.5 text-on-surface-variant/60 hover:text-secondary rounded-lg"
                          title="Edit Pertanyaan"
                        >
                          <Icon name="edit" size="sm" />
                        </button>
                        <button onClick={() => setDeleteTargetQuestion(q)} className="p-1.5 text-on-surface-variant/60 hover:text-rose-500 rounded-lg cursor-pointer" title="Hapus Pertanyaan">
                          <Icon name="delete" size="sm" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-primary">{q.question_text}</p>

                    {q.type === "MULTIPLE_CHOICE" && q.options && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant/60">Pilihan Jawaban:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="text-xs px-3 py-1.5 rounded-xl bg-surface-container-low text-primary border border-outline-variant/10 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {/* Delete Question Confirmation Modal */}
        <ConfirmModal isOpen={Boolean(deleteTargetQuestion)} onClose={() => setDeleteTargetQuestion(null)} onConfirm={handleDeleteQuestionConfirm} title="Hapus Pertanyaan Wawancara" message={`Apakah Anda yakin ingin menghapus pertanyaan "${deleteTargetQuestion?.question_text}"?`} confirmText="Hapus Pertanyaan" variant="danger" />
      </div>
    </div>
  )
}
