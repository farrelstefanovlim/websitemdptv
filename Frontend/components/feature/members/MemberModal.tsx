"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Select from "@/components/ui/Select";
import { type AppMember } from "@/stores/member.store";

interface MemberModalProps {
  member: AppMember | null;
  onClose: () => void;
  onSave: (data: Partial<AppMember>) => Promise<void> | void;
}

export default function MemberModal({ member, onClose, onSave }: MemberModalProps) {
  const [form, setForm] = useState({
    full_name: member?.name || "",
    angkatan: member?.angkatan || new Date().getFullYear(),
    division_id: member?.division_id || "", 
    is_active: member?.is_active ?? true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    import("@/lib/axios").then((module) => {
        module.default.get("/divisions")
        .then((res) => {
            if (res.data?.success) setDivisions(res.data.data);
        })
        .catch(() => console.error("Gagal memuat divisi"));
    });
  }, []);

  // We should ideally fetch the list of divisions from Division Store, but allowing them to input ID directly or hardcode fallback initially.
  // We'll leave division selection simple right now, requiring division_id to be populated.

  const handleSave = async () => {
    setError(null);
    if (!form.full_name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        name: form.full_name 
      });
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan data anggota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{member ? "Edit Anggota" : "Tambah Anggota Baru"}</h3>
          <Button variant="icon" size="icon" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>
        <div className="p-5 grid gap-3">
          {error && <Alert variant="error">{error}</Alert>}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Nama Lengkap *</label>
            <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={inputCls} placeholder="Nama lengkap" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Angkatan *</label>
            <input type="number" value={form.angkatan} onChange={(e) => set("angkatan", parseInt(e.target.value))} className={inputCls} placeholder="Tahun cth. 2024" />
          </div>
          <div>
            <Select
              label="Divisi"
              options={[
                { label: "Pilih Divisi (Opsional)", value: "" },
                ...divisions.map((d) => ({ label: d.name, value: d.id }))
              ]}
              value={form.division_id}
              onChange={(e: any) => set("division_id", e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Status</label>
            <Button type="button" size="none" onClick={() => set("is_active", !form.is_active)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${form.is_active ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100" : "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"}`}>
              {form.is_active ? "✓ Aktif" : "✕ Nonaktif"}
            </Button>
          </div>
        </div>
        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Batal</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSubmitting || !form.full_name.trim()}>
            {isSubmitting ? "Menyimpan..." : (member ? "Simpan" : "Tambah Anggota")}
          </Button>
        </div>
      </div>
    </div>
  );
}
