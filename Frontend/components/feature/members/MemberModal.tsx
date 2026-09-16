"use client"

import { useState, useEffect } from "react"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Alert from "@/components/ui/Alert"
import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Switch from "@/components/ui/Switch"
import Modal from "@/components/ui/Modal"
import { type AppMember } from "@/stores/member.store"
import { lookupMhsByNpm } from "@/lib/mhsLookup"
import { toast } from "@/stores/toast.store"
import api from "@/lib/axios"

interface MemberModalProps {
  member: AppMember | null
  onClose: () => void
  onSave: (data: any) => Promise<void> | void
}

export default function MemberModal({ member, onClose, onSave }: MemberModalProps) {
  const currentYear = new Date().getFullYear()

  const [form, setForm] = useState({
    full_name: member?.name || "",
    npm: member?.npm || "",
    email: member?.email || "",
    phone: member?.phone || "",
    angkatan: member?.angkatan || (member?.npm && member.npm.length >= 2 ? 2000 + parseInt(member.npm.substring(0, 2)) : currentYear),
    tahun_masuk: member?.tahun_masuk || currentYear,
    division_id: member?.division_id || "",
    is_core: member?.is_core ?? false,
    is_active: member?.is_active ?? true,
  })

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingMhs, setIsSearchingMhs] = useState(false)
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    api
      .get("/divisions")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDivisions(res.data.data)
        }
      })
      .catch(() => console.error("Gagal memuat divisi"))
  }, [])

  const handleNpmChange = async (val: string) => {
    const clean = val.trim()
    let derivedAngkatan = form.angkatan
    if (clean.length >= 2) {
      const prefix = parseInt(clean.substring(0, 2), 10)
      if (!isNaN(prefix) && prefix >= 10 && prefix <= 99) {
        derivedAngkatan = 2000 + prefix
      }
    }

    setForm((prev) => ({
      ...prev,
      npm: val,
      angkatan: derivedAngkatan,
    }))

    if (clean.length === 10 && /^\d+$/.test(clean)) {
      setIsSearchingMhs(true)
      try {
        const mhs = await lookupMhsByNpm(clean)
        if (mhs) {
          setForm((prev) => ({
            ...prev,
            npm: clean,
            full_name: mhs.name,
            email: mhs.email,
            angkatan: mhs.angkatan,
          }))
          toast.success(`Data mahasiswa ditemukan: ${mhs.name}`)
        }
      } catch (err) {
        console.error("Gagal lookup mahasiswa:", err)
      } finally {
        setIsSearchingMhs(false)
      }
    }
  }

  const handleSave = async () => {
    setError(null)
    if (!form.full_name.trim()) {
      setError("Nama lengkap anggota wajib diisi!")
      return
    }
    if (!form.angkatan || form.angkatan < 2000) {
      setError("Tahun angkatan mahasiswa tidak valid!")
      return
    }
    if (!form.tahun_masuk || form.tahun_masuk < 2000) {
      setError("Tahun masuk MDPTV tidak valid!")
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        full_name: form.full_name.trim(),
        name: form.full_name.trim(),
        npm: form.npm.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        angkatan: Number(form.angkatan),
        tahun_masuk: Number(form.tahun_masuk),
        division_id: form.division_id || undefined,
        is_core: form.is_core,
        is_active: form.is_active,
      })
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan data anggota")
    } finally {
      setIsSubmitting(false)
    }
  }

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="lg"
      title={member ? "Edit Data Anggota" : "Tambah Anggota Baru"}
      description="Masukkan 10 digit NPM untuk otomatis mengisi Nama, Email, dan Angkatan Mahasiswa"
      headerIcon="badge"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSubmitting} disabled={!form.full_name.trim()}>
            {member ? "Simpan Perubahan" : "Tambah Anggota"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        {/* NPM Mahasiswa (Lookup Trigger) */}
        <Input label="NPM Mahasiswa (10 Digit)" startIcon="tag" value={form.npm} onChange={(e) => handleNpmChange(e.target.value)} placeholder="Ketik NPM, contoh: 2428240153..." helperText={isSearchingMhs ? "Sedang mencari data mahasiswa..." : "Nama, Email, dan Angkatan Mahasiswa otomatis terisi sesuai database resmi MDP"} endIcon={isSearchingMhs ? <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" /> : undefined} />

        {/* Nama Lengkap */}
        <Input label="Nama Lengkap Anggota" required startIcon="person" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Contoh: Ahmad Rizki Hartawan" />

        {/* Email Kampus / Pribadi */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Email Mahasiswa" type="email" startIcon="mail" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama_npm@mhs.mdp.ac.id" />

          <Input label="Nomor WhatsApp / HP" type="tel" startIcon="call" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="081234567890" />
        </div>

        {/* Tahun Angkatan Mahasiswa & Tahun Masuk MDPTV */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input 
            label="Angkatan Mahasiswa (Kampus)" 
            required 
            type="number" 
            startIcon="school" 
            value={form.angkatan} 
            onChange={(e) => set("angkatan", parseInt(e.target.value) || 0)} 
            placeholder="Contoh: 2024"
            helperText="Tahun angkatan kuliah (otomatis dari NPM)" 
          />

          <Input 
            label="Tahun Masuk MDPTV" 
            required 
            type="number" 
            startIcon="event" 
            value={form.tahun_masuk} 
            onChange={(e) => set("tahun_masuk", parseInt(e.target.value) || 0)} 
            placeholder="Contoh: 2026"
            helperText="Tahun resmi bergabung ke MDPTV" 
          />
        </div>

        {/* Penempatan Divisi */}
        <div>
          <Select label="Penempatan Divisi" startIcon="category" options={[{ label: "Pilih Divisi (Opsional / Umum)", value: "" }, ...divisions.map((d) => ({ label: d.name, value: d.id }))]} value={form.division_id} onChange={(e) => set("division_id", e.target.value)} />
        </div>

        {/* Kategori Kepengurusan */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">Kategori Kepengurusan</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => set("is_core", true)} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${form.is_core ? "border-amber-400 bg-amber-50 text-amber-800 shadow-xs ring-2 ring-amber-400/20" : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant/70 hover:bg-surface-container-high"}`}>
              <Icon name="star" filled size="sm" className={form.is_core ? "text-amber-500" : ""} />
              <span>⭐ Pengurus Inti</span>
            </button>

            <button type="button" onClick={() => set("is_core", false)} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${!form.is_core ? "border-secondary bg-secondary/10 text-secondary shadow-xs ring-2 ring-secondary/20" : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant/70 hover:bg-surface-container-high"}`}>
              <Icon name="groups" size="sm" />
              <span>Anggota Biasa</span>
            </button>
          </div>
        </div>

        {/* Status Keaktifan dengan Switch */}
        <div className="p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40">
          <Switch checked={form.is_active} onChange={(checked) => set("is_active", checked)} label="Status Keaktifan Anggota" description={form.is_active ? "Anggota berstatus aktif dan akan muncul di daftar presensi / rekap" : "Anggota berstatus nonaktif atau cuti organisasi"} />
        </div>
      </div>
    </Modal>
  )
}
