"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Modal from "@/components/ui/Modal";
import Alert from "@/components/ui/Alert";
import type { GalleryItem } from "@/components/feature/content/types/content.type";
import { useGalleryStore } from "@/stores/gallery.store";

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
    <Modal
      isOpen={true}
      onClose={onCancel}
      size="2xl"
      title="Unggah Foto Dokumentasi"
      description="Tambahkan karya visual dan momen kegiatan studio UKM MDPTV"
      headerIcon="add_photo_alternate"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isUploading}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddClick}
            disabled={!preview || isUploading}
            isLoading={isUploading}
            startIcon={<Icon name="cloud_upload" size="sm" />}
          >
            Simpan Foto
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Hapus foto terpilih"
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
                  Mendukung JPG, PNG, WEBP, GIF (Maks 20MB via ImageKit)
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
          <Input
            label="Kategori / Label Acara"
            startIcon="label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Contoh: Workshop Sinematografi"
          />
          <Input
            label="Judul Dokumentasi"
            startIcon="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Contoh: Field Documentation 2026"
          />
        </div>

        {/* Featured Toggle */}
        <div className="p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40">
          <Switch
            checked={form.featured}
            onChange={(checked) => setForm({ ...form, featured: checked })}
            label="Foto Unggulan (Featured)"
            description="Tampilkan foto ini di bagian carousel/highlight dokumentasi halaman utama"
          />
        </div>
      </div>
    </Modal>
  );
}
