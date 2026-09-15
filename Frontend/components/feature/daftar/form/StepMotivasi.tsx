"use client";

import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

interface Props {
  form: any;
  set: (field: string, value: string) => void;
  inputCls: string;
  onEnter?: () => void;
}

export default function StepMotivasi({ form, set, inputCls, onEnter }: Props) {
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
              // [PERBAIKAN]: Menggunakan Ctrl + Enter agar user tetap bisa membuat baris baru (Enter biasa)
              if (e.key === "Enter" && e.ctrlKey && onEnter) {
                e.preventDefault();
                onEnter();
              }
            }}
          />
          <div className="flex justify-between mt-1.5">
            <span className={`text-[10px] ${form.motivation.length >= 10 ? "text-green-500" : "text-on-surface-variant/30"}`}>
              {form.motivation.length >= 10 ? "✓ Cukup" : `Minimal 10 karakter`}
            </span>
            <span className="text-[10px] text-on-surface-variant/30">{form.motivation.length} karakter (Gunakan Ctrl+Enter untuk submit)</span>
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