"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { getImageUrl } from "@/lib/image";
import { toast } from "@/stores/toast.store";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useSectionContentStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 20MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengupload gambar.";
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mb-4">
      <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-2">
        {label}
      </span>
      {value ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black group max-w-sm">
          <img src={getImageUrl(value)} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              variant="none"
              size="none"
              onClick={() => fileRef.current?.click()}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
            >
              <Icon name="edit" size="sm" className="text-gray-700" />
            </Button>
            <Button
              variant="none"
              size="none"
              onClick={() => onChange("")}
              className="w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors shadow-lg"
            >
              <Icon name="close" size="sm" className="text-white" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="none"
          size="none"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-outline-variant/25 bg-surface-container-lowest hover:border-secondary/40 hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="cloud_upload" className="text-on-surface-variant/30 !text-4xl" />
              <span className="text-xs text-on-surface-variant/40 font-medium px-4 text-center">
                Klik untuk upload foto ({label})
              </span>
            </>
          )}
        </Button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}
