"use client";

import { useEffect } from "react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

interface Props {
  form: any;
  set: (field: string, value: string) => void;
  inputCls: string;
  onEnter?: () => void;
}

export default function StepMotivasi({ form, set, inputCls, onEnter }: Props) {

// [PERBAIKAN FINAL]: Menambahkan sensor tombol Enter global yang cerdas
  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;

        // 1. Hindari error jika user mengklik tombol "Kembali / Kirim" menggunakan keyboard
        if (target.tagName === "BUTTON" || target.getAttribute("role") === "button") return;

        // 2. Jika user sedang mengetik di dalam textarea dan menekan Shift+Enter, biarkan (untuk bikin baris baru)
        if (target.tagName === "TEXTAREA" && e.shiftKey) return;

        // 3. Selain itu (tekan Enter biasa, baik di dalam maupun di luar kotak), langsung Submit!
        e.preventDefault();
        if (onEnter) onEnter();
      }
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [onEnter]);

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6">
        <h2 className="text-xl font-black text-primary mb-1">Motivasi</h2>
        <p className="text-sm text-on-surface-variant/50">Ceritakan alasanmu bergabung dengan MDPTV</p>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Motivasi Bergabung *</label>
          <textarea 
            value={form.motivation} 
            onChange={(e) => set("motivation", e.target.value)}
            rows={6} 
            className={`${inputCls} resize-none`}
            placeholder="Ceritakan pengalaman, skill, atau alasan kamu ingin bergabung dengan MDPTV... (minimal 10 karakter)" 
            onKeyDown={(e) => {
              // [PERBAIKAN]: Enter biasa untuk Submit, Shift + Enter untuk bikin baris baru
              if (e.key === "Enter" && !e.shiftKey && onEnter) {
                e.preventDefault();
                onEnter();
              }
            }}
          />
          <div className="flex justify-between mt-1.5">
            <span className={`text-[10px] ${form.motivation.length >= 10 ? "text-green-500" : "text-on-surface-variant/30"}`}>
              {form.motivation.length >= 10 ? "✓ Cukup" : `Minimal 10 karakter`}
            </span>
            <span className="text-[10px] text-on-surface-variant/30">{form.motivation.length} karakter (Tekan Enter untuk kirim, Shift+Enter untuk baris baru)</span>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-3">Ringkasan Pendaftaran</span>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant/50">Nama</span>
              <span className="font-medium text-primary">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant/50">NIM</span>
              <span className="font-medium text-primary">{form.nim}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant/50">Email</span>
              <span className="font-medium text-primary truncate ml-4">{form.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant/50">Divisi</span>
              <span className="font-medium text-secondary">{form.division}</span>
            </div>
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}