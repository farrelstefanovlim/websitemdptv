"use client";

import { useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
}

export default function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mb-4">
      <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-2">
        {label}
      </span>
      {value ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black group max-w-sm">
          <img src={value} alt="Section Background" className="w-full h-full object-cover" />
          <Button
            variant="none"
            size="none"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors shadow-lg z-10"
          >
            <Icon name="close" size="sm" className="text-white" />
          </Button>
        </div>
      ) : (
        <Button
          variant="none"
          size="none"
          onClick={() => fileRef.current?.click()}
          className="w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-outline-variant/25 bg-surface-container-lowest hover:border-secondary/40 hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <Icon name="cloud_upload" className="text-on-surface-variant/30 !text-4xl" />
          <span className="text-xs text-on-surface-variant/40 font-medium px-4 text-center">
            Klik untuk upload foto ({label})
          </span>
        </Button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}
