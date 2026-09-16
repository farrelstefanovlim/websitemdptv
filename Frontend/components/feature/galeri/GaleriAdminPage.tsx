"use client";

import { useState, useEffect } from "react";
import UploadPhotoForm from "./UploadPhotoForm";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import type { GalleryItem } from "@/components/feature/content/types/content.type";
import { getImageUrl } from "@/lib/image";
import { useGalleryStore } from "@/stores/gallery.store";
import Alert from "@/components/ui/Alert";

export default function GaleriAdminPage() {
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");

  const [showForm, setShowForm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { items, fetchGallery, deleteGalleryImage, toggleGalleryFeature, error: storeError } =
    useGalleryStore();

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Group items by uploadedAt date
  const grouped = items.reduce<Record<string, GalleryItem[]>>((acc, item) => {
    const date = item.uploadedAt || "Tanpa Tanggal";
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
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

  const handleAdd = async () => {
    setLocalError(null);
    setShowForm(false);
  };

  const handleDelete = async (item: GalleryItem) => {
    setLocalError(null);
    if (!item.id) {
      setLocalError("Error: Foto ini tidak memiliki ID valid di database.");
      return;
    }
    if (confirm(`Hapus foto "${item.title || "ini"}"?`)) {
      try {
        await deleteGalleryImage(item.id);
      } catch (e: any) {
        setLocalError(e?.response?.data?.message || "Gagal menghapus gambar.");
      }
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const topbarActions = (
    <div className="flex items-center gap-2">
      <a
        href="/galeri"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high text-xs font-semibold transition-all shrink-0"
      >
        <Icon name="open_in_new" size="sm" className="!text-xs" />
        <span className="hidden sm:inline">Preview</span>
      </a>
      <Button
        variant="none"
        size="none"
        onClick={() => setShowForm(!showForm)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 ${
          showForm
            ? "bg-surface-container-high text-on-surface hover:brightness-95"
            : "bg-secondary text-white hover:brightness-110 shadow-secondary/20"
        }`}
      >
        <Icon name={showForm ? "close" : "add_photo_alternate"} size="sm" className="!text-xs" />
        <span>{showForm ? "Batal" : "Tambah Foto"}</span>
      </Button>
    </div>
  );

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Galeri Dokumentasi
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        {items.length} foto dokumentasi tersimpan
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(topbarActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(topbarTitle, mobileTitlePortalTarget)}

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {(localError || storeError) && (
            <Alert variant="error" className="mb-6" title="Terjadi Kesalahan">
              {localError || storeError}
            </Alert>
          )}

          {/* Add Form Modal */}
          {showForm && (
            <UploadPhotoForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          )}

          {/* Gallery Content */}
          {items.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/15">
              <Icon name="photo_library" className="text-on-surface-variant/20 !text-6xl mx-auto mb-3" />
              <p className="text-base font-bold text-primary font-display">Belum ada foto dokumentasi</p>
              <p className="text-xs text-on-surface-variant/50 mt-1">
                Klik tombol &quot;Tambah Foto&quot; di atas untuk mulai mengunggah aset dokumentasi.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map((date) => {
                const groupItems = grouped[date];
                return (
                  <div key={date} className="space-y-3">
                    {/* Date Header Separator */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                        <Icon name="calendar_today" size="sm" className="!text-xs" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary font-display">
                          {formatDate(date)}
                        </h3>
                        <p className="text-[10px] text-on-surface-variant/50 font-medium">
                          {groupItems.length} foto diunggah
                        </p>
                      </div>
                      <div className="flex-1 h-[1px] bg-outline-variant/10 ml-2" />
                    </div>

                    {/* Photo Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {groupItems.map((item, gi) => (
                        <div
                          key={item.id || gi}
                          className="relative group rounded-2xl sm:rounded-3xl overflow-hidden border border-outline-variant/15 hover:border-secondary/40 transition-all duration-300 shadow-sm bg-surface-container-lowest"
                        >
                          {item.image && (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.title || `Foto ${gi + 1}`}
                              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}

                          {/* Top Featured Pill */}
                          {item.featured && (
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-md flex items-center gap-1">
                              <Icon name="star" filled size="sm" className="!text-[10px]" />
                              <span>Featured</span>
                            </div>
                          )}

                          {/* Hover Overlay Drawer */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="w-8 h-8 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                title="Hapus Foto"
                              >
                                <Icon name="delete" size="sm" className="!text-sm" />
                              </button>
                            </div>

                            <div>
                              {item.label && (
                                <span className="text-[9px] uppercase tracking-widest text-secondary-fixed-dim font-bold block mb-0.5">
                                  {item.label}
                                </span>
                              )}
                              {item.title && (
                                <span className="text-xs font-bold text-white leading-tight block truncate">
                                  {item.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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
