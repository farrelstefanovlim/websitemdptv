"use client";

import { useState, useEffect } from "react";
import UploadPhotoForm from "./UploadPhotoForm";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useHydrated } from "@/hooks/useHydrated";
import type { GalleryItem } from "@/components/feature/content/types/content.type";
import { getImageUrl } from "@/lib/image";
import { useGalleryStore } from "@/stores/gallery.store";
import Alert from "@/components/ui/Alert";
import { toast } from "@/stores/toast.store";

export default function GaleriAdminPage() {
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

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
    setShowForm(false);
    toast.success("Foto dokumentasi berhasil ditambahkan!");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteGalleryImage(deleteTarget.id);
      toast.success("Foto dokumentasi berhasil dihapus!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal menghapus gambar.");
    } finally {
      setDeleteTarget(null);
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
        variant="primary"
        size="xs"
        onClick={() => setShowForm(true)}
        startIcon={<Icon name="add_photo_alternate" size="sm" className="!text-xs" />}
      >
        Tambah Foto
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
        <div className="max-w-[1440px] mx-auto space-y-6">
          {storeError && (
            <Alert variant="error" title="Terjadi Kesalahan">
              {storeError}
            </Alert>
          )}

          {/* Add Form Modal */}
          {showForm && (
            <UploadPhotoForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          )}

          {/* Gallery Content */}
          {items.length === 0 ? (
            <EmptyState
              icon="photo_library"
              title="Belum Ada Foto Dokumentasi"
              description="Mulai unggah karya visual dan momen kegiatan studio MDPTV untuk ditampilkan pada website."
              actionText="Tambah Foto Baru"
              actionIcon="add_photo_alternate"
              onAction={() => setShowForm(true)}
            />
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
                          className="relative group rounded-2xl sm:rounded-3xl overflow-hidden border border-outline-variant/15 hover:border-secondary/40 transition-all duration-300 shadow-xs bg-surface-container-lowest"
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
                            <div className="absolute top-3 left-3">
                              <Badge variant="warning" size="sm" icon="star">
                                Featured
                              </Badge>
                            </div>
                          )}

                          {/* Hover Overlay Drawer */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="w-8 h-8 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Foto Dokumentasi"
        message={`Apakah Anda yakin ingin menghapus foto "${deleteTarget?.title || "ini"}"? Foto yang dihapus tidak dapat dipulihkan.`}
        confirmText="Hapus Foto"
        variant="danger"
      />
    </>
  );
}
