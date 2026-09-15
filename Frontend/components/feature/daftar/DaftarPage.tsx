"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useRecruitmentStore } from "@/stores/recruitment.store";

type Step = 1 | 2 | 3;

import RegistrationClosed from "./RegistrationClosed";
import RegistrationSuccess from "./RegistrationSuccess";
import StepDataDiri from "./form/StepDataDiri";
import StepPilihDivisi from "./form/StepPilihDivisi";
import StepMotivasi from "./form/StepMotivasi";

export default function DaftarPage() {
  const { addApplicant, registrationOpen, hasRegistered } = useRecruitmentStore();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    nim: "",
    email: "",
    phone: "",
    division: "",
    motivation: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleNext = () => {
    setErrorMSG(null);
    if (step === 1) {
      if (!form.name.trim()) return setErrorMSG("Nama Lengkap harus diisi!");
      if (!form.nim.trim() || !/^\d+$/.test(form.nim)) return setErrorMSG("NIM harus diisi dengan angka yang valid!");
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+@mhs\.mdp\.ac\.id$/.test(form.email)) return setErrorMSG("Gunakan email kampus yang valid!");
      if (!form.phone.trim() || !/^\d{10,}$/.test(form.phone)) return setErrorMSG("Nomor WhatsApp harus diisi dengan angka (minimal 10 digit)!");
      setStep(2);
    } else if (step === 2) {
      if (!form.division) return setErrorMSG("Silakan pilih Divisi terlebih dahulu!");
      setStep(3);
    }
  };

  const attemptSubmit = async () => {
    setErrorMSG(null);
    if (form.motivation.trim().length < 10) return setErrorMSG("Motivasi harus diisi minimal 10 karakter!");
    const success = await addApplicant(form);
    if (success) {
      setSubmitted(true);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-outline-variant/20 bg-white text-sm text-primary focus:outline-none focus:border-secondary/50 focus:ring-3 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/30";

  if (hasRegistered) return <RegistrationSuccess />;

  /* Registration closed */
  if (!registrationOpen) return <RegistrationClosed />;

  if (submitted) return <RegistrationSuccess />;

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

            {/* Steps Rendering */}
            {errorMSG && (
              <Alert variant="error" className="mb-6">
                {errorMSG}
              </Alert>
            )}
            {step === 1 && <StepDataDiri form={form} set={set} inputCls={inputCls} onEnter={handleNext} />}
            {step === 2 && <StepPilihDivisi selectedDivision={form.division} set={set} />}
            {step === 3 && <StepMotivasi form={form} set={set} inputCls={inputCls} onEnter={attemptSubmit} />}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button variant="outline" size="none" onClick={() => { setErrorMSG(null); setStep((s) => (s - 1) as Step); }}
                  className="flex-1 py-3.5 rounded-2xl text-sm justify-center">
                  Kembali
                </Button>
              )}
              {step < 3 ? (
                <Button variant="secondary" size="none" onClick={handleNext}
                  className="flex-1 py-3.5 rounded-2xl text-sm justify-center">
                  Selanjutnya
                </Button>
              ) : (
                <Button variant="secondary" size="none" onClick={attemptSubmit}
                  className="flex-1 py-3.5 rounded-2xl text-sm justify-center">
                  <Icon name="send" size="sm" /> Kirim Pendaftaran
                </Button>
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
