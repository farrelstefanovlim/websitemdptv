"use client";
import { useState, useRef } from "react";
import UploadPhotoForm from "./UploadPhotoForm";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import type { GalleryItem } from "@/stores/sectionContent.store";

export default function GaleriAdminPage() {
  const { documentation, addGalleryItem, removeGalleryItem } = useSectionContentStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleAdd = (item: GalleryItem) => {
    addGalleryItem(item);
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

  const mobileActions = (
    <>
      <a
        href="/galeri"
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-high transition-all shrink-0"
      >
        <Icon name="open_in_new" size="sm" />
      </a>
      <Button variant="secondary" size="none" onClick={() => setShowForm(!showForm)} className="w-auto px-2.5 h-8 flex items-center justify-center rounded-lg text-[10px] shrink-0 font-bold tracking-widest gap-1.5 uppercase">
        <Icon name={showForm ? "close" : "add_photo_alternate"} size="sm" className="!text-xs" />
        {showForm ? "Batal" : "Tambah"}
      </Button>
    </>
  );

  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Galeri Dokumentasi
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        {items.length} foto dokumentasi
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(mobileActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      {/* Top Bar */}
      <header className="hidden lg:block sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">
              Galeri Dokumentasi
            </h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">
              {items.length} foto dokumentasi
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="/galeri"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-high transition-all"
            >
              <Icon name="open_in_new" size="sm" />
              <span className="hidden sm:inline">Preview</span>
            </a>
            <Button variant="secondary" size="md"
              onClick={() => setShowForm(!showForm)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs"
            >
              <Icon name={showForm ? "close" : "add_photo_alternate"} size="sm" />
              {showForm ? "Batal" : "Tambah Foto"}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Add Form */}
          {showForm && (
            <UploadPhotoForm
              onAdd={handleAdd}
              onCancel={() => setShowForm(false)}
            />
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
                                <Button variant="none" size="none"
                                  onClick={() => handleDelete(originalIndex)}
                                  className="w-8 h-8 rounded-full bg-error/80 hover:bg-error flex items-center justify-center transition-colors"
                                >
                                  <Icon name="delete" size="sm" className="text-white !text-sm" />
                                </Button>
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
