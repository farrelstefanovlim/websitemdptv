"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useRecruitmentStore } from "@/stores/recruitment.store";

type Step = 1 | 2 | 3;

const DIVISIONS = [
  { value: "Photography & Videography", icon: "photo_camera", color: "bg-secondary/10 border-secondary/20 text-secondary" },
  { value: "Graphic Design", icon: "palette", color: "bg-tertiary-fixed/30 border-on-tertiary-fixed/10 text-on-tertiary-fixed" },
  { value: "Kominfo", icon: "hub", color: "bg-primary-fixed/30 border-on-primary-fixed/10 text-on-primary-fixed" },
];

export default function DaftarPage() {
  const { addApplicant, registrationOpen } = useRecruitmentStore();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nim: "",
    email: "",
    phone: "",
    division: "",
    motivation: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const canNext1 = form.name.trim() && form.nim.trim() && form.email.trim() && form.phone.trim();
  const canNext2 = !!form.division;
  const canSubmit = canNext1 && canNext2 && form.motivation.trim().length >= 20;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addApplicant(form);
    setSubmitted(true);
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-outline-variant/20 bg-white text-sm text-primary focus:outline-none focus:border-secondary/50 focus:ring-3 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/30";

  /* Registration closed */
  if (!registrationOpen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 noise-bg z-[1]" />
        <div className="fixed inset-0 grid-pattern z-0 opacity-30" />
        <AnimateOnScroll variant="scaleUp" className="relative z-10">
          <div className="bg-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 max-w-md w-full text-center border border-outline-variant/15 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <Icon name="lock" filled className="text-red-400 !text-5xl" />
            </div>
            <h2 className="text-2xl font-black text-primary mb-3">Pendaftaran Ditutup</h2>
            <p className="text-sm text-on-surface-variant/60 mb-8 leading-relaxed">
              Maaf, pendaftaran anggota MDPTV sedang tidak dibuka saat ini. Silakan cek kembali nanti untuk info pembukaan pendaftaran berikutnya.
            </p>
            <a href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all">
              <Icon name="arrow_back" size="sm" /> Kembali ke Beranda
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 noise-bg z-[1]" />
        <div className="fixed inset-0 grid-pattern z-0 opacity-30" />
        <AnimateOnScroll variant="scaleUp" className="relative z-10">
          <div className="bg-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 max-w-md w-full text-center border border-outline-variant/15 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <Icon name="check_circle" filled className="text-green-500 !text-5xl" />
            </div>
            <h2 className="text-2xl font-black text-primary mb-3">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-on-surface-variant/60 mb-8 leading-relaxed">
              Terima kasih telah mendaftar di MDPTV. Tim kami akan menghubungi kamu melalui email untuk proses selanjutnya.
            </p>
            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/15 mb-8">
              <div className="flex items-center gap-3">
                <Icon name="info" className="text-secondary" />
                <div className="text-left">
                  <p className="text-xs font-bold text-primary">Status: Pending Review</p>
                  <p className="text-[10px] text-on-surface-variant/50">Kamu akan dihubungi dalam 3-5 hari kerja</p>
                </div>
              </div>
            </div>
            <a href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all">
              <Icon name="arrow_back" size="sm" /> Kembali ke Beranda
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 noise-bg z-[1]" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-30" />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-4">
        <div className="max-w-lg mx-auto">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-on-surface-variant/50 hover:text-primary transition-colors mb-6">
            <Icon name="arrow_back" size="sm" /> Kembali
          </a>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Icon name="tv" filled className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-primary">MDPTV</h1>
              <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-medium">Pendaftaran Anggota</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="relative z-10 px-4 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s ? "bg-secondary text-white" : "bg-outline-variant/15 text-on-surface-variant/30"
                }`}>
                  {step > s ? <Icon name="check" size="sm" className="!text-sm" /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                  step >= s ? "text-secondary" : "text-on-surface-variant/30"
                }`}>
                  {s === 1 ? "Data Diri" : s === 2 ? "Pilih Divisi" : "Motivasi"}
                </span>
                {s < 3 && <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${step > s ? "bg-secondary" : "bg-outline-variant/15"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="relative z-10 px-4 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-outline-variant/15 shadow-xl">

            {/* Step 1: Data Diri */}
            {step === 1 && (
              <AnimateOnScroll variant="fadeUp">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-primary mb-1">Data Diri</h2>
                  <p className="text-sm text-on-surface-variant/50">Lengkapi informasi pribadimu</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Nama Lengkap *</label>
                    <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Masukkan nama lengkap" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">NIM *</label>
                    <input type="text" value={form.nim} onChange={(e) => set("nim", e.target.value)} className={inputCls} placeholder="Contoh: 2024001" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="nama@students.mdp.ac.id" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">No. WhatsApp *</label>
                    <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="08xxxxxxxxxx" />
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* Step 2: Pilih Divisi */}
            {step === 2 && (
              <AnimateOnScroll variant="fadeUp">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-primary mb-1">Pilih Divisi</h2>
                  <p className="text-sm text-on-surface-variant/50">Pilih divisi yang paling sesuai dengan minatmu</p>
                </div>
                <div className="grid gap-3">
                  {DIVISIONS.map((div) => {
                    const selected = form.division === div.value;
                    return (
                      <button key={div.value} onClick={() => set("division", div.value)}
                        className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${
                          selected
                            ? "border-secondary bg-secondary/5 shadow-md shadow-secondary/10"
                            : "border-outline-variant/15 hover:border-outline-variant/30 hover:bg-surface-container-low"
                        }`}>
                        <div className={`w-12 h-12 rounded-2xl ${div.color} flex items-center justify-center shrink-0 border`}>
                          <Icon name={div.icon} filled className="!text-xl" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-primary block">{div.value}</span>
                          <span className="text-[10px] text-on-surface-variant/50">
                            {div.value === "Photography & Videography" && "Fotografi, videografi, sinematografi"}
                            {div.value === "Graphic Design" && "Desain grafis, branding, UI/UX"}
                            {div.value === "Kominfo" && "Media sosial, public relations, IT"}
                          </span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          selected ? "border-secondary bg-secondary" : "border-outline-variant/25"
                        }`}>
                          {selected && <Icon name="check" size="sm" className="!text-xs text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </AnimateOnScroll>
            )}

            {/* Step 3: Motivasi */}
            {step === 3 && (
              <AnimateOnScroll variant="fadeUp">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-primary mb-1">Motivasi</h2>
                  <p className="text-sm text-on-surface-variant/50">Ceritakan alasanmu bergabung dengan MDPTV</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Motivasi Bergabung *</label>
                    <textarea value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
                      rows={6} className={`${inputCls} resize-none`}
                      placeholder="Ceritakan pengalaman, skill, atau alasan kamu ingin bergabung dengan MDPTV... (minimal 20 karakter)" />
                    <div className="flex justify-between mt-1.5">
                      <span className={`text-[10px] ${form.motivation.length >= 20 ? "text-green-500" : "text-on-surface-variant/30"}`}>
                        {form.motivation.length >= 20 ? "✓ Cukup" : `Minimal 20 karakter`}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/30">{form.motivation.length} karakter</span>
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
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => setStep((s) => (s - 1) as Step)}
                  className="flex-1 py-3.5 rounded-2xl border border-outline-variant/25 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all">
                  Kembali
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={step === 1 ? !canNext1 : !canNext2}
                  className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:hover:brightness-100">
                  Selanjutnya
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!canSubmit}
                  className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:hover:brightness-100 flex items-center justify-center gap-2">
                  <Icon name="send" size="sm" /> Kirim Pendaftaran
                </button>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-on-surface-variant/30 mt-6 px-4">
            Dengan mendaftar, kamu menyetujui bahwa data yang diberikan adalah benar dan bersedia mengikuti proses seleksi MDPTV.
          </p>
        </div>
      </main>
    </div>
  );
}
