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
  const [form, setForm] = useState({ label: "", title: "" });
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
        { label: form.label, title: form.title },
        selectedFile
      );
      
      const mockedItem: GalleryItem = {
        label: form.label,
        title: form.title,
        image: preview,
        uploadedAt: new Date().toISOString().split("T")[0],
        featured: false,
      };
      
      onAdd(mockedItem);
      
      setForm({ label: "", title: "" });
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isUploading ? undefined : onCancel} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in tracking-in fade-in zoom-in-95 duration-200 border-2 border-dashed border-secondary/30">
        
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 sm:p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            ) : (
              <Icon name="add_photo_alternate" className="text-secondary" />
            )}
            {isUploading ? "Mengupload..." : "Tambah Foto Baru"}
          </h3>
          <Button variant="icon" size="icon" onClick={onCancel} disabled={isUploading}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Image upload */}
            <div>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video group shadow-inner border border-outline-variant/10">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <Button variant="none" size="none"
                    onClick={() => setPreview("")}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Icon name="close" size="sm" className="text-white" />
                  </Button>
                </div>
              ) : (
                <Button variant="none" size="none"
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-outline-variant/25 bg-surface-container-lowest hover:border-secondary/40 hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Icon name="cloud_upload" className="text-on-surface-variant/30 !text-4xl" />
                  <span className="text-xs text-on-surface-variant/40 font-medium">
                    Klik untuk upload foto
                  </span>
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">
                  Label <span className="normal-case text-on-surface-variant/25">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Contoh: Workshop 2025"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface-container-low text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all shadow-sm inset-shadow-xs"
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
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface-container-low text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all shadow-sm inset-shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-container-lowest z-10 p-5 sm:p-6 border-t border-outline-variant/10 flex gap-3 justify-end mt-auto">
          <Button variant="ghost" size="sm"
            onClick={onCancel}
            disabled={isUploading}
          >
            Batal
          </Button>
          <Button variant="primary" size="sm"
            onClick={handleAddClick}
            disabled={!preview || isUploading}
          >
            <Icon name="add" size="sm" />
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
