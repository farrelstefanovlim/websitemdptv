"use client";

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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h2 className="text-headline-md text-2xl sm:text-3xl font-black text-primary mb-2">Data Diri</h2>
        <p className="text-sm text-on-surface-variant/60">Lengkapi formulir di bawah ini dengan data yang valid.</p>
      </div>

      <Alert variant="info" className="mb-6 text-left">
        Penting: Pastikan <strong>Nama Lengkap</strong> dan <strong>NIM</strong> yang diinput sesuai dengan Kartu Tanda Mahasiswa (KTM) yang terdaftar.
      </Alert>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Nama Lengkap *</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Masukkan nama lengkap" onKeyDown={handleKeyDown} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">NIM *</label>
          <input type="text" value={form.nim} onChange={(e) => set("nim", e.target.value)} className={inputCls} placeholder="Contoh: 2024001" onKeyDown={handleKeyDown} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Email Kampus *</label>
          {/* [PERBAIKAN]: Placeholder diubah untuk menegaskan aturan email kampus */}
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="nama@mhs.mdp.ac.id" onKeyDown={handleKeyDown} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">No. WhatsApp *</label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="08xxxxxxxxxx" onKeyDown={handleKeyDown} />
        </div>
      </div>
    </AnimateOnScroll>
  );
}