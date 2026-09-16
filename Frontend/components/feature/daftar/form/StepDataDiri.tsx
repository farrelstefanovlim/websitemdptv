"use client";

import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Icon from "@/components/ui/Icon";

interface Props {
  form: {
    name: string;
    nim: string;
    email: string;
    phone: string;
  };
  set: (field: string, value: string) => void;
  inputCls?: string;
  onEnter?: () => void;
}

export default function StepDataDiri({ form, set, onEnter }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  const fieldWrapperCls =
    "w-full pl-11 pr-4 py-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/30";

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
          <Icon name="badge" size="sm" className="!text-xs" />
          Langkah 1 dari 3
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-primary font-display mb-1">
          Identitas Diri
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant/60">
          Masukkan data diri resmi sesuai Kartu Tanda Mahasiswa (KTM) MDP.
        </p>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/5 border border-secondary/15 flex items-start gap-3 mb-6">
        <Icon name="info" className="text-secondary shrink-0 mt-0.5" size="sm" filled />
        <p className="text-xs text-on-surface-variant/80 leading-relaxed">
          Pastikan <strong>Nama Lengkap</strong>, <strong>NIM</strong>, dan <strong>Email Kampus</strong> yang digunakan adalah milik pribadi yang aktif untuk proses verifikasi.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
            Nama Lengkap *
          </label>
          <div className="relative">
            <Icon
              name="person"
              size="sm"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
            />
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={fieldWrapperCls}
              placeholder="Contoh: Ahmad Rizki"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* NIM */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
            NIM Mahasiswa *
          </label>
          <div className="relative">
            <Icon
              name="tag"
              size="sm"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
            />
            <input
              type="text"
              value={form.nim}
              onChange={(e) => set("nim", e.target.value)}
              className={fieldWrapperCls}
              placeholder="Contoh: 2428240153"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Email Kampus */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
            Email Kampus (@mhs.mdp.ac.id) *
          </label>
          <div className="relative">
            <Icon
              name="mail"
              size="sm"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={fieldWrapperCls}
              placeholder="nama_nim@mhs.mdp.ac.id"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Nomor WhatsApp */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
            Nomor WhatsApp *
          </label>
          <div className="relative">
            <Icon
              name="call"
              size="sm"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={fieldWrapperCls}
              placeholder="081234567890"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}
