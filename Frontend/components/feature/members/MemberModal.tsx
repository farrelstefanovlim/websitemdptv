"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Select from "@/components/ui/Select";
import { type AppMember } from "@/stores/member.store";
import api from "@/lib/axios";

interface MemberModalProps {
  member: AppMember | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
}

export default function MemberModal({ member, onClose, onSave }: MemberModalProps) {
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    full_name: member?.name || "",
    angkatan: member?.angkatan || currentYear,
    division_id: member?.division_id || "",
    is_core: member?.is_core ?? false,
    is_active: member?.is_active ?? true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get("/divisions")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDivisions(res.data.data);
        }
      })
      .catch(() => console.error("Gagal memuat divisi"));
  }, []);

  const handleSave = async () => {
    setError(null);
    if (!form.full_name.trim()) {
      setError("Nama lengkap anggota wajib diisi!");
      return;
    }
    if (!form.angkatan || form.angkatan < 2000) {
      setError("Tahun angkatan tidak valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        name: form.full_name.trim(),
        angkatan: Number(form.angkatan),
        division_id: form.division_id || undefined,
      });
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan data anggota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/30";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant/15">
        <div className="sticky top-0 bg-surface-container-lowest z-10 px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-primary font-display">
              {member ? "Edit Data Anggota" : "Tambah Anggota Baru"}
            </h3>
            <p className="text-[10px] text-on-surface-variant/50">
              Pengelolaan biodata dan status kepengurusan anggota
            </p>
          </div>
          <Button variant="icon" size="icon" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        <div className="p-6 grid gap-4">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Nama Lengkap */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              className={inputCls}
              placeholder="Contoh: Muhammad Raihan"
            />
          </div>

          {/* Kategori Anggota (Pengurus Inti vs Anggota Biasa) */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Kategori Kepengurusan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("is_core", true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  form.is_core
                    ? "border-amber-400 bg-amber-50 text-amber-800 shadow-sm ring-2 ring-amber-400/20"
                    : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant/70 hover:bg-surface-container-high"
                }`}
              >
                <Icon name="star" filled size="sm" className={form.is_core ? "text-amber-500" : ""} />
                <span>⭐ Pengurus Inti</span>
              </button>

              <button
                type="button"
                onClick={() => set("is_core", false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  !form.is_core
                    ? "border-secondary bg-secondary/10 text-secondary shadow-sm ring-2 ring-secondary/20"
                    : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant/70 hover:bg-surface-container-high"
                }`}
              >
                <Icon name="person" size="sm" />
                <span>Anggota Biasa</span>
              </button>
            </div>
          </div>

          {/* Angkatan / Tahun Masuk */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Tahun Angkatan / Masuk *
            </label>
            <input
              type="number"
              value={form.angkatan}
              onChange={(e) => set("angkatan", parseInt(e.target.value) || 0)}
              className={inputCls}
              placeholder="Contoh: 2024"
            />
            <span className="text-[9px] text-on-surface-variant/40 mt-1 block">
              Tahun angkatan masuk perkuliahan / organisasi
            </span>
          </div>

          {/* Divisi */}
          <div>
            <Select
              label="Penempatan Divisi"
              options={[
                { label: "Pilih Divisi (Opsional / Umum)", value: "" },
                ...divisions.map((d) => ({ label: d.name, value: d.id })),
              ]}
              value={form.division_id}
              onChange={(e: any) => set("division_id", e.target.value)}
            />
          </div>

          {/* Status Keaktifan */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Status Keaktifan
            </label>
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`w-full p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                form.is_active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
              }`}
            >
              <span>{form.is_active ? "Anggota Aktif Berorganisasi" : "Status Nonaktif / Cuti"}</span>
              <span className="font-extrabold">{form.is_active ? "✓ AKTIF" : "✕ NONAKTIF"}</span>
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || !form.full_name.trim()}
          >
            {isSubmitting ? "Menyimpan..." : member ? "Simpan Perubahan" : "Tambah Anggota"}
          </Button>
        </div>
      </div>
    </div>
  );
}
