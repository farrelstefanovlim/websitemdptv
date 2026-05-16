"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import type { GalleryItem } from "@/stores/sectionContent.store";

export default function GaleriAdminPage() {
  const { documentation, addGalleryItem, removeGalleryItem } = useSectionContentStore();
  const hydrated = useHydrated();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ label: "", title: "" });
  const [preview, setPreview] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const items = documentation.galleryItems;

  // Group items by uploadedAt date
  const grouped = items.reduce<Record<string, { items: GalleryItem[]; indices: number[] }>>((acc, item, i) => {
    const date = item.uploadedAt || "Tanpa Tanggal";
    if (!acc[date]) acc[date] = { items: [], indices: [] };
    acc[date].items.push(item);
    acc[date].indices.push(i);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === "Tanpa Tanggal") return 1;
    if (b === "Tanpa Tanggal") return -1;
    return b.localeCompare(a);
  });

  const formatDate = (dateStr: string) => {
    if (dateStr === "Tanpa Tanggal") return dateStr;
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!preview) return;
    const item: GalleryItem = {
      label: form.label,
      title: form.title,
      image: preview,
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    addGalleryItem(item);
    setForm({ label: "", title: "" });
    setPreview("");
    setShowForm(false);
  };

  const handleDelete = (originalIndex: number) => {
    if (confirm("Hapus foto ini?")) {
      removeGalleryItem(originalIndex);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">
              Galeri Dokumentasi
            </h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">
              {items.length} foto dokumentasi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/galeri"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-high transition-all"
            >
              <Icon name="open_in_new" size="sm" />
              <span className="hidden sm:inline">Preview</span>
            </a>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl bg-secondary text-on-secondary hover:brightness-110 transition-all"
            >
              <Icon name={showForm ? "close" : "add_photo_alternate"} size="sm" />
              {showForm ? "Batal" : "Tambah Foto"}
            </button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Add Form */}
          {showForm && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-secondary/30 bg-secondary/5">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <Icon name="add_photo_alternate" className="text-secondary" />
                Tambah Foto Baru
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Image upload */}
                <div>
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video group">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPreview("")}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                      >
                        <Icon name="close" size="sm" className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full aspect-video rounded-xl border-2 border-dashed border-outline-variant/25 bg-surface-container-lowest hover:border-secondary/40 hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icon name="cloud_upload" className="text-on-surface-variant/30 !text-4xl" />
                      <span className="text-xs text-on-surface-variant/40 font-medium">
                        Klik untuk upload foto
                      </span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">
                      Label <span className="normal-case text-on-surface-variant/25">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="Contoh: Workshop 2025"
                      className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">
                      Judul <span className="normal-case text-on-surface-variant/25">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Contoh: Cinematography Masterclass"
                      className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={!preview}
                    className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-on-secondary text-xs font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Icon name="add" size="sm" />
                    Tambah ke Galeri
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gallery grouped by date */}
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="photo_library" className="text-on-surface-variant/15 !text-6xl mx-auto mb-3" />
              <p className="text-on-surface-variant/40 text-sm">Belum ada foto dokumentasi</p>
              <p className="text-on-surface-variant/25 text-xs mt-1">
                Klik &quot;Tambah Foto&quot; untuk mulai menambahkan
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 sm:gap-10">
              {sortedDates.map((date) => {
                const group = grouped[date];
                return (
                  <div key={date}>
                    {/* Date header */}
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="calendar_today" size="sm" className="text-secondary/60" />
                      <h3 className="text-sm font-bold text-primary">
                        {formatDate(date)}
                      </h3>
                      <span className="text-[10px] text-on-surface-variant/40 font-medium">
                        {group.items.length} foto
                      </span>
                      <div className="flex-1 h-px bg-outline-variant/10" />
                    </div>

                    {/* Photo grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {group.items.map((item, gi) => {
                        const originalIndex = group.indices[gi];
                        return (
                          <div
                            key={originalIndex}
                            className="relative group rounded-xl sm:rounded-2xl overflow-hidden border border-outline-variant/15 hover:border-secondary/30 transition-all duration-300"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title || `Foto ${originalIndex + 1}`}
                                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full aspect-square bg-surface-container-high flex items-center justify-center">
                                <Icon name="image" className="text-on-surface-variant/15 !text-4xl" />
                              </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                              {/* Delete button */}
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleDelete(originalIndex)}
                                  className="w-8 h-8 rounded-full bg-error/80 hover:bg-error flex items-center justify-center transition-colors"
                                >
                                  <Icon name="delete" size="sm" className="text-white !text-sm" />
                                </button>
                              </div>
                              {/* Info */}
                              <div>
                                {item.label && (
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold block mb-0.5">
                                    {item.label}
                                  </span>
                                )}
                                {item.title && (
                                  <span className="text-xs font-bold text-white leading-tight block">
                                    {item.title}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
