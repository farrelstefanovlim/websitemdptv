"use client";

import { useEffect } from "react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Alert from "@/components/ui/Alert";

// [PERBAIKAN]: Interface sudah dirapikan agar TypeScript tidak error
interface Props {
  form: any;
  set: (field: string, value: string) => void;
  inputCls: string;
  onEnter?: () => void;
}

export default function StepDataDiri({ form, set, inputCls, onEnter }: Props) {
  // [PERBAIKAN]: Menambahkan deteksi tombol Enter global agar berfungsi meski input tidak sedang diklik
  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        // Hindari klik ganda jika user sedang menyeleksi tombol menggunakan keyboard
        if (target.tagName === "BUTTON" || target.getAttribute("role") === "button") return;
        
        e.preventDefault();
        if (onEnter) onEnter();
      }
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [onEnter]);

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h2 className="text-headline-md text-2xl sm:text-3xl font-black text-primary mb-2">Data Diri</h2>
        <p className="text-sm text-on-surface-variant/60">Lengkapi formulir di bawah ini dengan data yang valid.</p>
      </div>

      <Alert variant="info" className="mb-6 text-left">
        Penting: Pastikan <strong>Nama Lengkap</strong> dan <strong>NPM</strong> yang diinput sesuai dengan Kartu Tanda Mahasiswa (KTM) yang terdaftar.
      </Alert>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Nama Lengkap *</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Masukkan nama lengkap" autoComplete="name"/>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">NPM *</label>
          <input type="text" value={form.npm} onChange={(e) => set("npm", e.target.value)} className={inputCls} placeholder="Contoh: 2024001" autoComplete="off"/>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Email Kampus *</label>
          {/* [PERBAIKAN]: Placeholder diubah untuk menegaskan aturan email kampus */}
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="nama@mhs.mdp.ac.id" autoComplete="email"/>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">No. WhatsApp *</label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="08xxxxxxxxxx" autoComplete="tel"/>
        </div>
      </div>
    </AnimateOnScroll>
  );
}