"use client"

import { useRef, useEffect, useState } from "react"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Switch from "@/components/ui/Switch"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import ConfirmModal from "@/components/ui/ConfirmModal"
import ApplicantTable from "@/components/feature/recruitment/ApplicantTable"
import RecruitmentStats from "@/components/feature/recruitment/RecruitmentStats"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { toast } from "@/stores/toast.store"
import ActionMenu from "@/components/ui/ActionMenu"
import { useRecruitmentStore } from "@/stores/recruitment.store"
import { useHydrated } from "@/hooks/useHydrated"
import { exportToExcel, importFromExcel, RECRUITMENT_COLUMNS } from "@/lib/excel"

import { createPortal } from "react-dom"
import { usePortalTarget } from "@/hooks/usePortalTarget"

export default function RecruitmentPage() {
  const portalTarget = usePortalTarget("mobile-topbar-actions")
  const { applicants, addApplicant, registrationOpen, toggleRegistration, announcementOpen, announcementPeriod, toggleAnnouncement, fetchAnnouncementState, fetchApplicants, groupLink, setGroupLink, fetchGroupLink, saveGroupLinkToDb, selectedPeriod, availablePeriods, setSelectedPeriod, fetchPeriods, createPeriod, deletePeriod, isLoading } = useRecruitmentStore()

  const pendingCount = applicants.filter((a) => a.status === "pending").length
  const hydrated = useHydrated()
  const importRef = useRef<HTMLInputElement>(null)

  // Period Modals State
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false)
  const [newPeriodInput, setNewPeriodInput] = useState("")
  const [newPeriodTitle, setNewPeriodTitle] = useState("")
  const [newPeriodIsActive, setNewPeriodIsActive] = useState(false)
  const [deleteTargetPeriod, setDeleteTargetPeriod] = useState<string | null>(null)

  // Fetch data dari API saat mount
  useEffect(() => {
    fetchPeriods()
    fetchApplicants()
    fetchAnnouncementState()
    fetchGroupLink()
  }, [fetchPeriods, fetchApplicants, fetchAnnouncementState, fetchGroupLink])

  const handleExport = () => {
    exportToExcel(applicants, RECRUITMENT_COLUMNS, `penerimaan_anggota_${selectedPeriod.replace(/[^a-zA-Z0-9]/g, "_")}`, "Pendaftar")
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const rows = await importFromExcel(file, RECRUITMENT_COLUMNS)
      let imported = 0
      for (const row of rows) {
        if (!row.name || !row.npm) continue
        await addApplicant({
          name: row.name,
          npm: row.npm,
          email: row.email || "",
          phone: row.phone || "",
          division: row.division || "Photography & Videography",
          motivation: row.motivation || "",
          cv_url: row.cv_url || undefined,
          portfolio_url: row.portfolio_url || undefined,
          period: row.period || selectedPeriod,
        })
        imported++
      }
      toast.success(`Berhasil import ${imported} pendaftar ke periode ${selectedPeriod}`)
    } catch {
      toast.error("Gagal membaca file Excel")
    }
    e.target.value = ""
  }

  const handleCreatePeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPeriodInput.trim()) {
      toast.error("Nama periode tidak boleh kosong (contoh: 2026/2027)")
      return
    }

    const success = await createPeriod(newPeriodInput.trim(), newPeriodTitle.trim() || undefined, newPeriodIsActive)

    if (success) {
      toast.success(`Periode ${newPeriodInput.trim()} berhasil dibuat!`)
      setShowAddPeriodModal(false)
      setNewPeriodInput("")
      setNewPeriodTitle("")
      setNewPeriodIsActive(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  const topbarActions = (
    <>
      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] font-bold">{pendingCount} Pending</span>
        </div>
      )}
    </>
  )

  return (
    <>
      {hydrated && portalTarget && createPortal(topbarActions, portalTarget)}

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* ── Page Header ────────────────────────────────────── */}
          <AdminPageHeader
            breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Penerimaan" }]}
            icon="person_add"
            title="Penerimaan Anggota Baru"
            description={`Kelola pendaftaran calon anggota, seleksi berkas, dan status kelulusan (Periode: Tahun ${selectedPeriod}).`}
            badge={
              announcementOpen && announcementPeriod === selectedPeriod ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/20">
                  <Icon name="campaign" size="xs" />
                  <span>Publik di /pengumuman</span>
                </span>
              ) : undefined
            }
            actions={
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Period Tabs */}
                <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/15 overflow-x-auto">
                  {availablePeriods.map((p) => {
                    const isSelected = p === selectedPeriod
                    return (
                      <button key={p} type="button" onClick={() => setSelectedPeriod(p)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${isSelected ? "bg-secondary text-white shadow-xs shadow-secondary/20" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"}`}>
                        {p}
                      </button>
                    )
                  })}
                </div>

                {/* Add Period Button */}
                <Button variant="outline" size="sm" onClick={() => setShowAddPeriodModal(true)} startIcon={<Icon name="add" size="xs" />} className="shrink-0 text-xs font-bold">
                  <span>Periode Baru</span>
                </Button>
              </div>
            }
          />

          {/* Top 3 Control Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Registration Status */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${registrationOpen ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-rose-500/10 border-rose-500/20 text-rose-500"}`}>
                  <Icon name={registrationOpen ? "lock_open" : "lock"} size="md" filled />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary truncate">Pendaftaran {registrationOpen ? "Dibuka" : "Ditutup"}</p>
                  <p className="text-[11px] text-on-surface-variant/60 truncate">{registrationOpen ? "/daftar bisa diakses" : "/daftar ditutup"}</p>
                </div>
              </div>
              <Switch checked={registrationOpen} onChange={toggleRegistration} size="md" />
            </div>

            {/* Card 2: Announcement Status */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${announcementOpen ? "bg-blue-500/10 border-blue-500/20 text-blue-600" : "bg-slate-500/10 border-slate-500/20 text-slate-500"}`}>
                  <Icon name={announcementOpen ? "campaign" : "visibility_off"} size="md" filled />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary truncate">Pengumuman {announcementOpen ? "Dibuka" : "Ditutup"}</p>
                  <p className="text-[11px] text-on-surface-variant/60 truncate">{announcementOpen ? `Hasil ${announcementPeriod} tampil di /pengumuman` : "Pengumuman disembunyikan"}</p>
                </div>
              </div>
              <Switch checked={announcementOpen} onChange={() => toggleAnnouncement(selectedPeriod)} size="md" />
            </div>

            {/* Card 3: WhatsApp Group Link Input */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Icon name="link" size="xs" />
                </div>
                <span className="text-xs font-bold text-primary truncate">Link Grup WhatsApp</span>
              </div>

              <div className="flex items-center gap-2">
                <input type="text" value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="flex-1 w-full text-xs py-2 px-3 border border-outline-variant/20 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 text-primary bg-surface-container-low" />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    const success = await saveGroupLinkToDb(groupLink)
                    if (success) toast.success("Link WhatsApp berhasil disimpan!")
                  }}
                  disabled={isLoading}
                  className="!py-2 !px-3.5 !rounded-xl text-xs shrink-0"
                >
                  {isLoading ? "..." : "Simpan"}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Table & Stats Layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Stats — shown first on mobile */}
            <div className="lg:col-span-2 lg:order-2">
              <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-4 sm:p-6 lg:sticky lg:top-24">
                <RecruitmentStats />
              </div>
            </div>

            {/* Table */}
            <div className="lg:col-span-3 lg:order-1">
              <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-4 sm:p-6">
                <ApplicantTable
                  actions={
                    <>
                      <ActionMenu
                        actions={[
                          { label: "Import Excel", icon: "upload", onClick: () => importRef.current?.click() },
                          { label: "Export Excel", icon: "download", onClick: handleExport, variant: "success" },
                        ]}
                      />
                      <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Periode Baru */}
      {showAddPeriodModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddPeriodModal(false)}
          size="sm"
          title="Tambah Periode Penerimaan"
          description="Buat tahun periode pendaftaran baru (contoh: 2026/2027)"
          headerIcon="calendar_add_on"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowAddPeriodModal(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreatePeriodSubmit} disabled={!newPeriodInput.trim()}>
                Simpan Periode
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreatePeriodSubmit} className="space-y-4 text-left">
            <Input label="Format Periode (Tahun/Tahun)" required startIcon="event" placeholder="Contoh: 2026/2027 atau 2027/2028" value={newPeriodInput} onChange={(e) => setNewPeriodInput(e.target.value)} helperText="Format standar berupa Tahun Ajaran / Kepengurusan" />

            <Input label="Judul / Keterangan Periode (Opsional)" startIcon="title" placeholder="Contoh: Penerimaan Gelombang 1 2026/2027" value={newPeriodTitle} onChange={(e) => setNewPeriodTitle(e.target.value)} />

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15">
              <Switch checked={newPeriodIsActive} onChange={setNewPeriodIsActive} label="Jadikan Periode Aktif Pendaftaran" description="Pendaftar baru di /daftar otomatis masuk ke periode ini" />
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Period Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetPeriod)}
        onClose={() => setDeleteTargetPeriod(null)}
        onConfirm={async () => {
          if (deleteTargetPeriod) {
            const success = await deletePeriod(deleteTargetPeriod)
            if (success) {
              toast.success(`Periode ${deleteTargetPeriod} berhasil dihapus.`)
              setDeleteTargetPeriod(null)
            }
          }
        }}
        title="Hapus Periode Penerimaan"
        message={`Apakah Anda yakin ingin menghapus periode "${deleteTargetPeriod}"? Data pendaftar pada periode ini tidak akan terhapus namun periode tidak akan muncul di daftar.`}
        confirmText="Hapus Periode"
        variant="danger"
      />
    </>
  )
}
