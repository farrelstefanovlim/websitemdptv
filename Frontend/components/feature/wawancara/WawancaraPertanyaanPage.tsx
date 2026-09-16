"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { wawancaraService, InterviewQuestion } from "@/services/wawancara.service";

export default function WawancaraPertanyaanPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2027]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal CRUD Pertanyaan State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "ESSAY">("ESSAY");
  const [optionList, setOptionList] = useState<string[]>(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"]);

  const loadQuestions = async (year: number) => {
    setIsLoading(true);
    try {
      const [yearsRes, qRes] = await Promise.all([
        wawancaraService.getYears(),
        wawancaraService.getQuestions(year),
      ]);

      if (yearsRes.success && yearsRes.data.length > 0) {
        setAvailableYears(yearsRes.data);
      }
      if (qRes.success) {
        setQuestions(qRes.data);
      }
    } catch (err) {
      console.error("Gagal memuat pertanyaan wawancara:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(selectedYear);
  }, [selectedYear]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Mohon isi teks pertanyaan.");
      return;
    }

    try {
      const validOptions = questionType === "MULTIPLE_CHOICE" ? optionList.filter((o) => o.trim() !== "") : [];

      if (editingQuestion) {
        await wawancaraService.updateQuestion(editingQuestion.id, {
          question_text: questionText.trim(),
          type: questionType,
          options: validOptions,
        });
      } else {
        await wawancaraService.createQuestion({
          year_period: selectedYear,
          question_text: questionText.trim(),
          type: questionType,
          options: validOptions,
          order: questions.length + 1,
        });
      }

      setShowQuestionModal(false);
      setEditingQuestion(null);
      setQuestionText("");
      setQuestionType("ESSAY");
      setOptionList(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"]);
      await loadQuestions(selectedYear);
    } catch (err) {
      alert("Gagal menyimpan pertanyaan.");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?")) return;
    try {
      await wawancaraService.deleteQuestion(id);
      await loadQuestions(selectedYear);
    } catch (err) {
      alert("Gagal menghapus pertanyaan.");
    }
  };

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
      await loadQuestions(parsed);
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
      await loadQuestions(nextYear);
    } catch (err) {
      alert("Gagal menghapus periode tahun.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primary font-display flex items-center gap-2">
            <Icon name="help_outline" className="text-secondary" />
            Kelola Pertanyaan Wawancara ({selectedYear})
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Buat dan atur soal pertanyaan wawancara (Pilihan Ganda / Essay) untuk calon anggota baru.
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
                  <span>Tahun {yr}</span>
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

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingQuestion(null);
              setQuestionText("");
              setQuestionType("ESSAY");
              setOptionList(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"]);
              setShowQuestionModal(true);
            }}
          >
            <Icon name="add" size="sm" />
            <span>Buat Pertanyaan Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Questions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary font-display">
            Daftar Soal Wawancara Tahun {selectedYear} ({questions.length} Soal)
          </h2>
          <Link
            href="/admin/wawancara/jawaban"
            className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
          >
            <span>Buka Form Pengisian Jawaban</span>
            <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Memuat daftar pertanyaan...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30 text-xs text-on-surface-variant flex flex-col items-center gap-3">
            <Icon name="quiz" size="lg" className="text-on-surface-variant/30" />
            <p className="font-semibold text-primary">Belum ada pertanyaan wawancara untuk tahun {selectedYear}.</p>
            <p className="text-on-surface-variant/60 max-w-sm">
              Klik tombol <b>Buat Pertanyaan Baru</b> di atas untuk menambahkan soal pilihan ganda atau essay.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingQuestion(null);
                setQuestionText("");
                setQuestionType("ESSAY");
                setOptionList(["Sangat Siap", "Cukup Siap", "Perlu Pertimbangan"]);
                setShowQuestionModal(true);
              }}
            >
              <Icon name="add" size="sm" />
              <span>Buat Pertanyaan Baru</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-5 shadow-xs hover:border-secondary/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-secondary text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                        {q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setQuestionText(q.question_text);
                          setQuestionType(q.type);
                          setOptionList(q.options && q.options.length > 0 ? q.options : ["Opsi 1", "Opsi 2"]);
                          setShowQuestionModal(true);
                        }}
                        className="p-1.5 text-on-surface-variant/60 hover:text-secondary rounded-lg"
                        title="Edit Pertanyaan"
                      >
                        <Icon name="edit" size="sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-on-surface-variant/60 hover:text-rose-500 rounded-lg"
                        title="Hapus Pertanyaan"
                      >
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
                          <div
                            key={oIdx}
                            className="text-xs px-3 py-1.5 rounded-xl bg-surface-container-low text-primary border border-outline-variant/10 flex items-center gap-2"
                          >
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
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <Icon name="help_outline" className="text-secondary" />
                {editingQuestion ? "Edit Pertanyaan Wawancara" : "Buat Pertanyaan Wawancara Baru"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowQuestionModal(false)}>
                <Icon name="close" size="sm" />
              </Button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1">Teks Pertanyaan</label>
                <textarea
                  rows={3}
                  placeholder="Misal: Apa motivasi utama Anda bergabung dengan MDPTV?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Tipe Pertanyaan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestionType("ESSAY")}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      questionType === "ESSAY"
                        ? "bg-secondary text-white border-secondary"
                        : "border-outline-variant/20 text-on-surface-variant"
                    }`}
                  >
                    Essay / Isian Bebas
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionType("MULTIPLE_CHOICE")}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      questionType === "MULTIPLE_CHOICE"
                        ? "bg-secondary text-white border-secondary"
                        : "border-outline-variant/20 text-on-surface-variant"
                    }`}
                  >
                    Pilihan Ganda
                  </button>
                </div>
              </div>

              {questionType === "MULTIPLE_CHOICE" && (
                <div className="space-y-2 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/15">
                  <label className="block font-bold text-primary">Daftar Pilihan Jawaban</label>
                  {optionList.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant/60">{oIdx + 1}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...optionList];
                          updated[oIdx] = e.target.value;
                          setOptionList(updated);
                        }}
                        className="flex-1 p-2 rounded-xl border border-outline-variant/20 bg-background text-primary"
                        placeholder={`Pilihan ${oIdx + 1}`}
                      />
                      {optionList.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOptionList(optionList.filter((_, i) => i !== oIdx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Icon name="close" size="sm" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOptionList([...optionList, `Pilihan ${optionList.length + 1}`])}
                  >
                    <Icon name="add" size="sm" />
                    <span>Tambah Pilihan Jawaban</span>
                  </Button>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-outline-variant/15">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowQuestionModal(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <span>Simpan Pertanyaan</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
