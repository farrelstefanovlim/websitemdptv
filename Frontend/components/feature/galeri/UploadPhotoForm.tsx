"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import type { GalleryItem } from "@/stores/sectionContent.store";

interface UploadPhotoFormProps {
  onAdd: (item: GalleryItem) => void;
  onCancel: () => void;
}

export default function UploadPhotoForm({ onAdd, onCancel }: UploadPhotoFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ label: "", title: "" });
  const [preview, setPreview] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddClick = () => {
    if (!preview) return;
    const item: GalleryItem = {
      label: form.label,
      title: form.title,
      image: preview,
      uploadedAt: new Date().toISOString().split("T")[0],
      featured: false,
    };
    onAdd(item);
    setForm({ label: "", title: "" });
    setPreview("");
  };

  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-secondary/30 bg-secondary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <Icon name="add_photo_alternate" className="text-secondary" />
          Tambah Foto Baru
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Image upload */}
        <div>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <Button variant="none" size="none"
                onClick={() => setPreview("")}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <Icon name="close" size="sm" className="text-white" />
              </Button>
            </div>
          ) : (
            <Button variant="none" size="none"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-outline-variant/25 bg-surface-container-lowest hover:border-secondary/40 hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
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
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button variant="outline" size="none"
              onClick={onCancel}
              className="px-4 py-3 text-xs"
            >
              Batal
            </Button>
            <Button variant="primary" size="none"
              onClick={handleAddClick}
              disabled={!preview}
              className="px-4 py-3 text-xs"
            >
              <Icon name="add" size="sm" />
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
