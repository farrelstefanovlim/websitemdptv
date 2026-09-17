"use client"

import { useEffect, useState } from "react"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"
import Icon from "@/components/ui/Icon"
import Input from "@/components/ui/Input"
import Alert from "@/components/ui/Alert"
import Badge from "@/components/ui/Badge"
import { lookupMhsByNpm } from "@/lib/mhsLookup"
import { toast } from "@/stores/toast.store"

interface Props {
  form: {
    name: string
    npm: string
    email: string
    phone: string
  }
  set: (field: string, value: string) => void
  inputCls?: string
  onEnter?: () => void
}

export default function StepDataDiri({ form, set, onEnter }: Props) {
  const [isSearchingMhs, setIsSearchingMhs] = useState(false)

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement
        if (target.tagName === "BUTTON" || target.getAttribute("role") === "button") return
        e.preventDefault()
        if (onEnter) onEnter()
      }
    }

    window.addEventListener("keydown", handleGlobalEnter)
    return () => window.removeEventListener("keydown", handleGlobalEnter)
  }, [onEnter])

  const handleNpmChange = async (val: string) => {
    set("npm", val)
    const clean = val.trim()
    if (clean.length === 10 && /^\d+$/.test(clean)) {
      setIsSearchingMhs(true)
      try {
        const mhs = await lookupMhsByNpm(clean)
        if (mhs) {
          set("name", mhs.name)
          set("email", mhs.email)
          toast.success(`Data mahasiswa ditemukan: ${mhs.name}`)
        }
      } catch (err) {
        console.error("Gagal lookup mahasiswa:", err)
      } finally {
        setIsSearchingMhs(false)
      }
    }
  }

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 text-left">
        <div className="mb-2">
          <Badge variant="default" size="sm" icon="badge">
            Langkah 1 dari 3
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-primary font-display mb-1">Identitas Diri</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant/60">Masukkan 10 digit NPM mahasiswa. Nama lengkap dan email resmi akan terisi otomatis.</p>
      </div>

      <div className="mb-6">
        <Alert variant="info">
          Cukup masukkan <strong>10 digit NPM</strong> Anda, sistem akan secara otomatis memverifikasi <strong>Nama Lengkap</strong> dan <strong>Email Kampus</strong> dari database resmi Universitas MDP.
        </Alert>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* NPM Mahasiswa (First input) */}
        <Input label="NPM Mahasiswa" required startIcon="tag" inputSize="lg" value={form.npm} onChange={(e) => handleNpmChange(e.target.value)} placeholder="Contoh: 2428240153" autoComplete="off" helperText={isSearchingMhs ? "Mencari data mahasiswa..." : "Ketik 10 digit NPM untuk verifikasi instan"} endIcon={isSearchingMhs ? <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" /> : undefined} />

        {/* Nama Lengkap */}
        <Input label="Nama Lengkap" required startIcon="person" inputSize="lg" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nama otomatis terisi setelah NPM..." autoComplete="name" />

        {/* Email Kampus */}
        <Input label="Email Kampus" required type="email" startIcon="mail" inputSize="lg" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama_npm@mhs.mdp.ac.id" autoComplete="email" />

        {/* Nomor WhatsApp */}
        <Input label="Nomor WhatsApp Aktif" required type="tel" startIcon="call" inputSize="lg" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="081234567890" autoComplete="tel" helperText="Digunakan untuk koordinasi jadwal wawancara" />
      </div>
    </AnimateOnScroll>
  )
}
