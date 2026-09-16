"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useRecruitmentStore } from "@/stores/recruitment.store";

type Step = 1 | 2 | 3;

import RegistrationClosed from "./RegistrationClosed";
import RegistrationSuccess from "./RegistrationSuccess";
import StepDataDiri from "./form/StepDataDiri";
import StepPilihDivisi from "./form/StepPilihDivisi";
import StepMotivasi from "./form/StepMotivasi";

export default function DaftarPage() {
  const { addApplicant, registrationOpen, hasRegistered, isLoading, error: storeError } =
    useRecruitmentStore();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    npm: "",
    email: "",
    phone: "",
    division: "",
    motivation: "",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleNext = () => {
    setErrorMSG(null);
    if (step === 1) {
      if (!form.name.trim()) return setErrorMSG("Nama Lengkap wajib diisi!");
      if (!form.npm.trim() || !/^\d+$/.test(form.npm.trim()))
        return setErrorMSG("NPM wajib diisi dengan angka yang valid!");
      if (!form.email.trim() || !/^[^\s@]+@mhs\.mdp\.ac\.id$/i.test(form.email.trim()))
        return setErrorMSG("Gunakan format email kampus resmi (@mhs.mdp.ac.id)!");
      if (!form.phone.trim() || !/^\d{10,}$/.test(form.phone.trim().replace(/\D/g, "")))
        return setErrorMSG("Nomor WhatsApp minimal 10 digit angka!");
      setStep(2);
    } else if (step === 2) {
      if (!form.division) return setErrorMSG("Silakan pilih salah satu Divisi terlebih dahulu!");
      setStep(3);
    }
  };

  const attemptSubmit = async () => {
    if (isLoading || isSubmitting) return;
    setErrorMSG(null);
    if (form.motivation.trim().length < 10)
      return setErrorMSG("Motivasi harus diisi minimal 10 karakter!");

    setIsSubmitting(true);
    try {
      const success = await addApplicant({
        ...form,
        name: form.name.trim(),
        npm: form.npm.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });
      if (!success) {
        setErrorMSG("Pendaftaran gagal dikirim. Pastikan NPM/Email belum pernah terdaftar.");
      }
    } catch {
      setErrorMSG("Terjadi gangguan saat mengirim formulir. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRegistered) return <RegistrationSuccess />;
  if (!registrationOpen) return <RegistrationClosed />;

  const displayError = errorMSG || (step === 3 ? storeError : null);

  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between">
      {/* Background Overlays */}
      <div className="fixed inset-0 noise-bg z-[1] pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-30 pointer-events-none" />

      {/* ── Top Studio Header ─────────────────────────────────── */}
      <header className="relative z-10 pt-6 pb-2 px-4 sm:px-8">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant/70 hover:text-primary transition-colors py-2"
          >
            <Icon name="arrow_back" size="sm" className="!text-xs" />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm shadow-secondary/20">
              <Icon name="tv" filled size="sm" className="!text-sm" />
            </div>
            <span className="text-sm font-black tracking-tight text-primary font-display">
              MDPTV
            </span>
          </div>
        </div>
      </header>

      {/* ── Progress Stepper Bar ───────────────────────────────── */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: "Data Diri" },
              { num: 2, label: "Pilih Divisi" },
              { num: 3, label: "Motivasi & Kirim" },
            ].map((s) => (
              <div key={s.num} className="flex-1 flex items-center gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= s.num
                      ? "bg-secondary text-white shadow-sm shadow-secondary/30"
                      : "bg-surface-container-high text-on-surface-variant/40"
                  }`}
                >
                  {step > s.num ? (
                    <Icon name="check" size="sm" className="!text-xs font-bold" />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                    step >= s.num ? "text-primary" : "text-on-surface-variant/30"
                  }`}
                >
                  {s.label}
                </span>
                {s.num < 3 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                      step > s.num ? "bg-secondary" : "bg-outline-variant/15"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Form Card ────────────────────────────────────── */}
      <main className="relative z-10 px-4 py-6 flex-1 flex flex-col justify-center">
        <div className="max-w-xl w-full mx-auto">
          <div className="bg-surface-container-lowest rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-outline-variant/15 shadow-xl">
            {displayError && (
              <Alert variant="error" className="mb-6 text-left">
                {displayError}
              </Alert>
            )}

            {step === 1 && <StepDataDiri form={form} set={set} onEnter={handleNext} />}
            {step === 2 && <StepPilihDivisi selectedDivision={form.division} set={set} onEnter={handleNext} />}
            {step === 3 && <StepMotivasi form={form} set={set} onEnter={attemptSubmit} />}

            {/* Step Navigation Controls */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-outline-variant/10">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="none"
                  onClick={() => {
                    setErrorMSG(null);
                    setStep((s) => (s - 1) as Step);
                  }}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold justify-center"
                >
                  Kembali
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="none"
                  onClick={handleNext}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold justify-center shadow-md shadow-secondary/20"
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="none"
                  onClick={attemptSubmit}
                  disabled={isSubmitting || isLoading}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold justify-center shadow-lg shadow-secondary/30 disabled:opacity-50"
                >
                  {isSubmitting || isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim Berkas...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Icon name="send" size="sm" />
                      Kirim Pendaftaran
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-[10px] text-on-surface-variant/40 mt-5 px-4 font-medium">
            Data pendaftaran hanya digunakan untuk kepentingan verifikasi seleksi internal UKM MDPTV Universitas Multi Data Palembang.
          </p>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-on-surface-variant/40">
        © {new Date().getFullYear()} MDPTV • Creative Media & Television
      </footer>
    </div>
  );
}
