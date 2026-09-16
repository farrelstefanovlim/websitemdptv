"use client";

import { useState, useEffect } from "react";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
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
    status: (kegiatan?.status || "draft") as KegiatanStatus,
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="xl"
      title={kegiatan ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
      description="Kelola agenda acara, penanggung jawab, anggaran, dan status kegiatan UKM"
      headerIcon="event_available"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (form.title.trim()) onSave(form);
            }}
            disabled={!form.title.trim()}
          >
            {kegiatan ? "Simpan Perubahan" : "Tambah Kegiatan"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {/* Nama Kegiatan */}
        <Input
          label="Nama Kegiatan"
          required
          startIcon="title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Workshop Cinematography & Video Editing"
        />

        {/* Deskripsi */}
        <Textarea
          label="Deskripsi Kegiatan"
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Jelaskan tujuan, target audiens, dan detail kegiatan..."
        />

        {/* Divisi & Tanggal */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Select
            label="Divisi Penyelenggara"
            startIcon="category"
            value={form.division}
            onChange={(e) => set("division", e.target.value)}
            options={[
              ...divisionOptions.map((name) => ({ label: name, value: name })),
              { label: "All Division", value: "All Division" },
            ]}
          />
          <DatePicker
            label="Tanggal Pelaksanaan"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>

        {/* Lokasi & PIC */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Lokasi Acara"
            startIcon="location_on"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Lab Multimedia / Gedung B"
          />
          <Input
            label="Penanggung Jawab (PIC)"
            startIcon="person"
            value={form.pic}
            onChange={(e) => set("pic", e.target.value)}
            placeholder="Nama koordinator acara"
          />
        </div>

        {/* Anggaran & Status */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Estimasi Anggaran"
            startIcon="payments"
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            placeholder="Rp 1.500.000"
          />
          <Select
            label="Status Kegiatan"
            startIcon="flag"
            value={form.status}
            onChange={(e) => set("status", e.target.value as KegiatanStatus)}
            options={ALL_STATUSES.map((s) => ({ label: STATUS_CONFIG[s].label, value: s }))}
          />
        </div>

        {/* Catatan Tambahan */}
        <Textarea
          label="Catatan Tambahan"
          rows={2}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Catatan administrasi, perizinan, atau logistik..."
        />
      </div>
    </Modal>
  );
}
