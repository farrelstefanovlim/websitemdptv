"use client";

import { useEffect, useState, useRef } from "react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import api from "@/lib/axios";
import { toast } from "@/stores/toast.store";

interface Props {
  form: {
    name: string;
    npm: string;
    email: string;
    phone: string;
    division: string;
    motivation: string;
    cv_url: string;
    portfolio_url: string;
  };
  set: (field: string, value: string) => void;
  inputCls?: string;
  onEnter?: () => void;
}

export default function StepMotivasi({ form, set, onEnter }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        if (target.tagName === "BUTTON" || target.getAttribute("role") === "button") return;
        if (target.tagName === "TEXTAREA" && e.shiftKey) return;
        if (target.tagName === "INPUT") return;
        e.preventDefault();
        if (onEnter) onEnter();
      }
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [onEnter]);

  const isMotivationValid = form.motivation.trim().length >= 10;
  const charCount = form.motivation.length;

  const isPdf = form.cv_url.toLowerCase().includes(".pdf") || fileName.toLowerCase().endsWith(".pdf");

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const processFileUpload = async (file: File) => {
    if (!file) return;

    // Validasi Ukuran (Maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran berkas terlalu besar! Maksimal 10MB.");
      return;
    }

    // Validasi Format (PDF / Gambar)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)) {
      toast.error("Format berkas tidak didukung! Gunakan PDF, JPG, PNG, atau WebP.");
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success" && res.data?.data?.url) {
        set("cv_url", res.data.data.url);
        toast.success(`Berkas ${file.name} berhasil diunggah ke cloud!`);
      } else {
        throw new Error(res.data?.message || "Gagal mengunggah berkas");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.message || "Gagal mengunggah berkas ke ImageKit. Coba lagi.";
      toast.error(msg);
      set("cv_url", "");
      setFileName("");
      setFileSize("");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFileUpload(file);
  };

  const handleRemoveFile = () => {
    set("cv_url", "");
    setFileName("");
    setFileSize("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Berkas CV / Foto dihapus.");
  };

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 text-left">
        <div className="mb-2">
          <Badge variant="default" size="sm" icon="description">
            Langkah 3 dari 3
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-primary font-display mb-1">
          Motivasi & Lampiran Berkas
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant/60">
          Ceritakan alasanmu dan lampirkan berkas CV / Foto diri atau Portofolio (opsional).
        </p>
      </div>

      <div className="grid gap-5">
        {/* Motivasi Textarea */}
        <div>
          <Textarea
            label="Motivasi & Alasan Bergabung"
            required
            rows={4}
            value={form.motivation}
            onChange={(e) => set("motivation", e.target.value)}
            placeholder="Ceritakan minatmu, pengalaman organisasi/kreatif (jika ada), atau alasan memilih divisi ini... (minimal 10 karakter)"
          />

          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  isMotivationValid ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                }`}
              />
              <span
                className={`text-[11px] font-semibold ${
                  isMotivationValid ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {isMotivationValid ? "Motivasi memenuhi syarat" : "Minimal 10 karakter"}
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant/40 font-medium">
              {charCount} karakter
            </span>
          </div>
        </div>

        {/* Upload CV / Foto & Link Portfolio */}
        <div className="space-y-4 text-left">
          {/* File Upload Section for CV / Foto */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Unggah CV / Resume / Foto Diri (Opsional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {form.cv_url ? (
              /* Uploaded File Card */
              <div className="p-4 rounded-2xl border border-secondary/25 bg-secondary/5 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? "bg-rose-500/15 text-rose-600" : "bg-blue-500/15 text-blue-600"}`}>
                    <Icon name={isPdf ? "picture_as_pdf" : "image"} size="sm" filled />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">
                      {fileName || "Berkas_CV_Foto"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/60 flex items-center gap-1 mt-0.5">
                      <span className="font-semibold">{isPdf ? "Dokumen PDF" : "Foto / Gambar"}</span>
                      {fileSize && <span>• {fileSize}</span>}
                      <span className="text-emerald-600 font-bold">• Terunggah di Cloud</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={form.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-xs font-bold text-primary border border-outline-variant/20 hover:border-secondary/40 hover:text-secondary transition-all shadow-xs"
                    title="Buka Berkas di Tab Baru"
                  >
                    <Icon name="visibility" size="xs" />
                    <span className="hidden sm:inline">Lihat</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Hapus / Ganti Berkas"
                  >
                    <Icon name="delete" size="sm" />
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone Input */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!isUploading) fileInputRef.current?.click();
                }}
                className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface-container-lowest text-center ${
                  isDragOver
                    ? "border-secondary bg-secondary/5 ring-4 ring-secondary/10"
                    : "border-outline-variant/25 hover:border-secondary/50 hover:bg-surface-container-low"
                } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
              >
                {isUploading ? (
                  <div className="py-2 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                    <span className="text-xs font-bold text-secondary">
                      Mengunggah berkas ke cloud ImageKit...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                      <Icon name="cloud_upload" size="sm" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">
                        Klik untuk memilih berkas atau drag & drop di sini
                      </p>
                      <p className="text-[10px] text-on-surface-variant/50 mt-0.5">
                        Mendukung format <strong>PDF</strong>, <strong>JPG</strong>, <strong>PNG</strong>, atau <strong>WebP</strong> (Maksimal 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Portfolio Link Input */}
          <div>
            <Input
              label="Link Portofolio / Showreel / Karya (Opsional)"
              startIcon="folder_special"
              value={form.portfolio_url}
              onChange={(e) => set("portfolio_url", e.target.value)}
              placeholder="https://behance.net/... atau link Google Drive / YouTube / Sosmed"
              helperText="Tautan hasil karya, video showreel, desain grafis, artikel, atau portofolio online Anda"
            />
          </div>
        </div>

        {/* Executive Review Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-surface-container-low/70 border border-outline-variant/15 text-left">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-outline-variant/10">
            <Icon name="verified_user" size="sm" className="text-secondary" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
              Ringkasan Data Formulir
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-0.5">
                Nama Lengkap
              </span>
              <span className="font-bold text-primary truncate block">
                {form.name || "-"}
              </span>
            </div>

            <div>
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-0.5">
                NPM Mahasiswa
              </span>
              <span className="font-bold text-primary font-display block">
                {form.npm || "-"}
              </span>
            </div>

            <div>
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-0.5">
                Email Kampus
              </span>
              <span className="font-medium text-primary truncate block">
                {form.email || "-"}
              </span>
            </div>

            <div>
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-0.5">
                Nomor WhatsApp
              </span>
              <span className="font-medium text-primary block">
                {form.phone || "-"}
              </span>
            </div>

            <div>
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-0.5">
                Berkas CV / Foto Diri
              </span>
              <span className="font-medium text-primary truncate block">
                {form.cv_url ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <Icon name="check_circle" size="xs" />
                    <span>{isPdf ? "Dokumen PDF Terunggah" : "Foto / Gambar Terunggah"}</span>
                  </span>
                ) : (
                  "Tidak disertakan"
                )}
              </span>
            </div>

            <div>
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-0.5">
                Link Portofolio
              </span>
              <span className="font-medium text-primary truncate block">
                {form.portfolio_url ? (
                  <span className="inline-flex items-center gap-1 text-secondary font-bold">
                    <Icon name="link" size="xs" />
                    <span>Tautan Disertakan</span>
                  </span>
                ) : (
                  "Tidak disertakan"
                )}
              </span>
            </div>

            <div className="sm:col-span-2 pt-1">
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-1">
                Pilihan Divisi
              </span>
              <Badge variant="default" size="md" icon="check">
                {form.division || "Belum dipilih"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}
