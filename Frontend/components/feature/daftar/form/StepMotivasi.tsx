"use client";

import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Icon from "@/components/ui/Icon";

interface Props {
  form: {
    name: string;
    nim: string;
    email: string;
    phone: string;
    division: string;
    motivation: string;
  };
  set: (field: string, value: string) => void;
  inputCls?: string;
  onEnter?: () => void;
}

export default function StepMotivasi({ form, set, onEnter }: Props) {
  const isMotivationValid = form.motivation.trim().length >= 10;
  const charCount = form.motivation.length;

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
          <Icon name="description" size="sm" className="!text-xs" />
          Langkah 3 dari 3
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-primary font-display mb-1">
          Motivasi & Review Berkas
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant/60">
          Ceritakan alasan, pengalaman, atau tujuanmu bergabung bersama tim MDPTV.
        </p>
      </div>

      <div className="grid gap-5">
        {/* Motivasi Textarea */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
            Motivasi & Pengalaman *
          </label>
          <div className="relative">
            <textarea
              value={form.motivation}
              onChange={(e) => set("motivation", e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all resize-none placeholder:text-on-surface-variant/30 leading-relaxed"
              placeholder="Ceritakan minatmu, portofolio singkat (jika ada), atau mengapa kamu tertarik bergabung di divisi yang kamu pilih... (minimal 10 karakter)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onEnter) {
                  e.preventDefault();
                  onEnter();
                }
              }}
            />
          </div>

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
              {charCount} karakter • <span className="text-secondary/70">Ctrl+Enter</span> kirim
            </span>
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
                NIM Mahasiswa
              </span>
              <span className="font-bold text-primary font-display block">
                {form.nim || "-"}
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

            <div className="sm:col-span-2 pt-1">
              <span className="text-on-surface-variant/50 block text-[10px] uppercase font-bold mb-1">
                Pilihan Divisi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold">
                <Icon name="check" size="sm" className="!text-xs" />
                {form.division || "Belum dipilih"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}
