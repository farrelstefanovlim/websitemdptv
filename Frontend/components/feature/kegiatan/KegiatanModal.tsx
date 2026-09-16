"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import Button from "@/components/ui/Button";
import { type Kegiatan, type KegiatanStatus } from "@/stores/kegiatan.store";
import { STATUS_CONFIG, ALL_STATUSES } from "./utils";
import api from "@/lib/axios";

interface KegiatanModalProps {
  kegiatan: Kegiatan | null;
  onClose: () => void;
  onSave: (data: Partial<Kegiatan>) => void;
}

export default function KegiatanModal({ kegiatan, onClose, onSave }: KegiatanModalProps) {
  const [divisionOptions, setDivisionOptions] = useState<string[]>([
    "Photography & Videography",
    "Graphic Design",
    "Kominfo",
    "Pengelola Sumber Daya Manusia",
    "Hubungan Masyarakat",
  ]);

  const [form, setForm] = useState({
    title: kegiatan?.title || "",
    description: kegiatan?.description || "",
    division: kegiatan?.division || "Photography & Videography",
    date: kegiatan?.date || "",
    location: kegiatan?.location || "",
    pic: kegiatan?.pic || "",
    budget: kegiatan?.budget || "",
    status: kegiatan?.status || "draft" as KegiatanStatus,
    notes: kegiatan?.notes || "",
  });

  useEffect(() => {
    api.get("/divisions")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setDivisionOptions(res.data.data.map((d: any) => d.name));
        }
      })
      .catch(() => {
        // use default
      });
  }, []);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{kegiatan ? "Edit Kegiatan" : "Tambah Kegiatan"}</h3>
          <Button variant="icon" size="icon" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>
        <div className="p-5 grid gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Nama Kegiatan *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Workshop Cinematography" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Jelaskan kegiatan..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Divisi"
              value={form.division}
              onChange={(e) => set("division", e.target.value)}
              options={[
                ...divisionOptions.map((name) => ({ label: name, value: name })),
                { label: "All Division", value: "All Division" },
              ]}
            />
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Tanggal</label>
              <DatePicker value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Lokasi</label>
              <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} placeholder="Lab Multimedia" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">PIC</label>
              <input type="text" value={form.pic} onChange={(e) => set("pic", e.target.value)} className={inputCls} placeholder="Nama penanggung jawab" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Anggaran</label>
              <input type="text" value={form.budget} onChange={(e) => set("budget", e.target.value)} className={inputCls} placeholder="Rp 1.000.000" />
            </div>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              options={ALL_STATUSES.map((s) => ({ label: STATUS_CONFIG[s].label, value: s }))}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Catatan</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Catatan tambahan..." />
          </div>
        </div>
        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={() => { if (form.title.trim()) onSave(form); }}
            disabled={!form.title.trim()}>
            {kegiatan ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </div>
    </div>
  );
}
