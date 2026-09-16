"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import type { GalleryItem } from "@/components/feature/content/types/content.type";
import { useGalleryStore } from "@/stores/gallery.store";
import Alert from "@/components/ui/Alert";

interface UploadPhotoFormProps {
  onAdd: (item: GalleryItem) => void;
  onCancel: () => void;
}

export default function UploadPhotoForm({ onAdd, onCancel }: UploadPhotoFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { addGalleryImage } = useGalleryStore();
  const [form, setForm] = useState({ label: "", title: "", featured: false });
  const [preview, setPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddClick = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await addGalleryImage(
        { label: form.label, title: form.title, featured: form.featured },
        selectedFile
      );

      const mockedItem: GalleryItem = {
        label: form.label,
        title: form.title,
        image: preview,
        uploadedAt: new Date().toISOString().split("T")[0],
        featured: form.featured,
      };

      onAdd(mockedItem);
      setForm({ label: "", title: "", featured: false });
      setPreview("");
      setSelectedFile(null);
    } catch (e: any) {
      console.error(e);
      setError("Gagal mengupload file ke server. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isUploading ? undefined : onCancel}
      />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-outline-variant/15">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest z-10 px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-primary font-display flex items-center gap-2">
              <Icon name="add_photo_alternate" className="text-secondary" />
              <span>Unggah Foto Dokumentasi</span>
            </h3>
            <p className="text-[10px] text-on-surface-variant/50">
              Tambahkan karya dan momen kegiatan studio MDPTV
            </p>
          </div>
          <Button variant="icon" size="icon" onClick={onCancel} disabled={isUploading}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Upload Area */}
          <div>
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video group border border-outline-variant/15 bg-black/5">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview("");
                    setSelectedFile(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Icon name="close" size="sm" className="!text-sm" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-outline-variant/20 bg-surface-container-low/40 hover:border-secondary/50 hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Icon name="cloud_upload" size="md" />
                </div>
                <div>
                  <span className="text-xs font-bold text-primary block">
                    Pilih File Foto / Dokumentasi
                  </span>
                  <span className="text-[10px] text-on-surface-variant/50">
                    Mendukung JPG, PNG, WEBP (Maks 10MB)
                  </span>
                </div>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Metadata Inputs */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1">
                Kategori / Label Acara
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Contoh: Workshop Sinematografi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1">
                Judul Dokumentasi
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Field Documentation 2025"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, featured: !form.featured })}
              className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                form.featured
                  ? "border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400/20"
                  : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant/70 hover:bg-surface-container-high"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="star" size="sm" filled={form.featured} className={form.featured ? "text-amber-500" : ""} />
                <span>Jadikan Foto Unggulan (Featured di Halaman Utama)</span>
              </div>
              <span>{form.featured ? "✓ YA" : "TIDAK"}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-container-lowest z-10 p-5 border-t border-outline-variant/10 flex gap-2.5 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isUploading}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddClick}
            disabled={!preview || isUploading}
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengunggah...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="cloud_upload" size="sm" className="!text-xs" />
                <span>Simpan Foto</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
