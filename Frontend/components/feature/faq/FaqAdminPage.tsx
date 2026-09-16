"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { faqService, FaqItem } from "@/services/faq.service";

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Umum",
    order: 0,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await faqService.getAll();
      if (res.success) {
        setFaqs(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar FAQ:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const categories = Array.from(new Set(faqs.map((f) => f.category || "Umum")));

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "Umum",
      order: faqs.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "Umum",
      order: faq.order,
      is_active: faq.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Pertanyaan dan jawaban wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFaq) {
        await faqService.update(editingFaq.id, formData);
        alert("FAQ berhasil diperbarui!");
      } else {
        await faqService.create(formData);
        alert("FAQ baru berhasil ditambahkan!");
      }
      setShowModal(false);
      await loadFaqs();
    } catch (err) {
      alert("Gagal menyimpan FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (faq: FaqItem) => {
    try {
      await faqService.update(faq.id, { is_active: !faq.is_active });
      await loadFaqs();
    } catch (err) {
      alert("Gagal mengubah status FAQ.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan FAQ ini?")) return;
    try {
      await faqService.delete(id);
      await loadFaqs();
    } catch (err) {
      alert("Gagal menghapus FAQ.");
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || (f.category || "Umum") === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const activeCount = faqs.filter((f) => f.is_active).length;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primary font-display flex items-center gap-2">
            <Icon name="quiz" className="text-secondary" />
            Manajemen FAQ (Frequently Asked Questions)
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Kelola daftar pertanyaan dan jawaban seputar UKM MDPTV untuk admin dan calon anggota.
          </p>
        </div>

        <Button onClick={handleOpenAddModal} variant="primary" className="!rounded-xl shrink-0">
          <Icon name="add" size="sm" />
          <span>Tambah FAQ</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Icon name="help_outline" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
              Total FAQ
            </p>
            <p className="text-xl font-black text-primary font-display">{faqs.length} Pertanyaan</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Icon name="check_circle" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
              Status Aktif
            </p>
            <p className="text-xl font-black text-emerald-600 font-display">{activeCount} Tampil</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Icon name="category" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
              Kategori
            </p>
            <p className="text-xl font-black text-purple-600 font-display">
              {categories.length || 1} Kategori
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
              size="sm"
            />
            <input
              type="text"
              placeholder="Cari pertanyaan atau jawaban FAQ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/20 bg-background text-xs font-medium text-primary focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                categoryFilter === "ALL" ? "bg-background text-primary shadow-xs" : "text-on-surface-variant/60"
              }`}
            >
              Semua ({faqs.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === cat ? "bg-background text-secondary shadow-xs" : "text-on-surface-variant/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-surface-container-lowest p-12 text-center text-xs font-bold text-on-surface-variant/60 rounded-3xl border border-outline-variant/15">
            Memuat data FAQ...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 text-center space-y-3 rounded-3xl border border-outline-variant/15">
            <Icon name="quiz" size="lg" className="text-on-surface-variant/30" />
            <p className="text-xs font-bold text-on-surface-variant/60">
              Belum ada pertanyaan FAQ. Klik tombol &quot;Tambah FAQ&quot; untuk membuat pertanyaan baru.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-xs overflow-hidden transition-all"
              >
                {/* Header item */}
                <div
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-surface-container-low/40 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-surface-container-low text-on-surface-variant/60 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary border border-secondary/20">
                          {faq.category || "Umum"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            faq.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-surface-container text-on-surface-variant/50"
                          }`}
                        >
                          {faq.is_active ? "Aktif" : "Draft"}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-primary truncate">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleActive(faq)}
                      title={faq.is_active ? "Sembunyikan dari Publik" : "Tampilkan ke Publik"}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.is_active ? "text-emerald-600 hover:bg-emerald-500/10" : "text-on-surface-variant/40 hover:bg-surface-container-low"
                      }`}
                    >
                      <Icon name={faq.is_active ? "visibility" : "visibility_off"} size="sm" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(faq)}
                      title="Edit FAQ"
                      className="p-2 rounded-lg text-secondary hover:bg-secondary/10 transition-colors"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      title="Hapus FAQ"
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                    <button
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors"
                    >
                      <Icon name={isExpanded ? "expand_less" : "expand_more"} size="sm" />
                    </button>
                  </div>
                </div>

                {/* Body answer */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-outline-variant/10 text-xs text-on-surface-variant leading-relaxed bg-surface-container-low/20">
                    <p className="font-bold text-primary mb-1 text-[11px] uppercase tracking-wider text-secondary">
                      Jawaban:
                    </p>
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary font-display">
                {editingFaq ? "Edit Pertanyaan FAQ" : "Tambah Pertanyaan FAQ Baru"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant/40 hover:text-primary">
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">
                  Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Bagaimana cara mendaftar anggota baru UKM MDPTV?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-bold">
                  Jawaban Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Masukkan jawaban lengkap..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">Kategori</label>
                  <input
                    type="text"
                    placeholder="Umum, Pendaftaran, Absensi, Kas"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1 font-bold">Urutan Tampil</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl border border-outline-variant/20 bg-background text-primary font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded-md accent-secondary cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-primary cursor-pointer">
                  Tampilkan ke Publik / Calon Anggota (Aktif)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan FAQ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
