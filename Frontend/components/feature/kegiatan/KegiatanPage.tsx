"use client"

import { useState, useRef, useEffect } from "react"
import Icon from "@/components/ui/Icon"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { useKegiatanStore, type Kegiatan, type KegiatanStatus } from "@/stores/kegiatan.store"
import { useHydrated } from "@/hooks/useHydrated"
import { exportToExcel, importFromExcel, KEGIATAN_COLUMNS } from "@/lib/excel"
import { toast } from "@/stores/toast.store"
import Button from "@/components/ui/Button"
import ConfirmModal from "@/components/ui/ConfirmModal"
import KegiatanModal from "./KegiatanModal"
import ProposalUploader from "./ProposalUploader"
import ActionMenu from "@/components/ui/ActionMenu"
import { STATUS_CONFIG, ALL_STATUSES, formatDate } from "./utils"

export default function KegiatanPage() {
  const { items, addKegiatan, updateKegiatan, removeKegiatan, fetchKegiatan } = useKegiatanStore()
  const hydrated = useHydrated()
  const [statusFilter, setStatusFilter] = useState<KegiatanStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modal, setModal] = useState<{ mode: "add" | "edit"; kegiatan: Kegiatan | null } | null>(null)
  const [deleteTargetKegiatan, setDeleteTargetKegiatan] = useState<Kegiatan | null>(null)
  const excelImportRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchKegiatan()
  }, [fetchKegiatan])

  const handleExport = () => {
    exportToExcel(items as any[], KEGIATAN_COLUMNS, "kegiatan_mdptv", "Kegiatan")
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const rows = await importFromExcel(file, KEGIATAN_COLUMNS)
      let imported = 0
      for (const row of rows) {
        if (!row.title) continue
        addKegiatan({
          title: row.title,
          description: row.description || "",
          division: row.division || "All Division",
          date: row.date || "",
          location: row.location || "",
          status: (["draft", "diajukan", "disetujui", "ditolak", "selesai"].includes(row.status || "") ? row.status : "draft") as KegiatanStatus,
          pic: row.pic || "",
          budget: row.budget || "",
          proposal: null,
          notes: row.notes || "",
        })
        imported++
      }
      toast.success(`Berhasil import ${imported} kegiatan`)
    } catch {
      toast.error("Gagal membaca file Excel")
    }
    e.target.value = ""
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  const counts = ALL_STATUSES.reduce((acc, s) => ({ ...acc, [s]: items.filter((k) => k.status === s).length }), {} as Record<KegiatanStatus, number>)

  const filtered = items.filter((k) => {
    const matchesFilter = statusFilter === "all" || k.status === statusFilter
    const s = search.toLowerCase()
    const matchesSearch = k.title.toLowerCase().includes(s) || k.division.toLowerCase().includes(s)
    return matchesFilter && matchesSearch
  })

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <input ref={excelImportRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />

          {/* ── Page Header ────────────────────────────────────── */}
          <AdminPageHeader
            breadcrumbs={[{ label: "Operasional & Anggota" }, { label: "Kegiatan & Event" }]}
            icon="event"
            title="Kegiatan"
            description="Kelola agenda, dokumentasi, dan proposal."
            actions={
              <>
                <Button variant="outline" size="sm" onClick={() => excelImportRef.current?.click()} startIcon={<Icon name="upload" size="sm" />}>
                  Import Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} startIcon={<Icon name="download" size="sm" />}>
                  Export Excel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setModal({ mode: "add", kegiatan: null })} startIcon={<Icon name="add" size="sm" />}>
                  Tambah Kegiatan
                </Button>
              </>
            }
          />

          {/* Status Count Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ALL_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s]
              return (
                <div key={s} className={`p-4 rounded-2xl sm:rounded-3xl border transition-all ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-xl bg-white/60">
                      <Icon name={cfg.icon} size="sm" className={`${cfg.color} !text-base`} />
                    </div>
                    <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-primary font-display">{counts[s]}</div>
                </div>
              )
            })}
          </div>

          {/* Toolbar: Search, Filter & Actions */}
          <div className="mb-6 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Icon name="search" size="sm" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-sm focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/40" placeholder="Cari judul kegiatan atau divisi..." />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Filter Menu */}
              <ActionMenu
                triggerIcon="filter_list"
                title="Saring Status Kegiatan"
                actions={[
                  {
                    label: "Semua Status",
                    icon: "list",
                    active: statusFilter === "all",
                    onClick: () => setStatusFilter("all"),
                  },
                  ...ALL_STATUSES.map((s) => ({
                    label: STATUS_CONFIG[s].label,
                    icon: STATUS_CONFIG[s].icon,
                    active: statusFilter === s,
                    onClick: () => setStatusFilter(s),
                  })),
                ]}
              />

              {/* Actions Menu */}
              <ActionMenu
                actions={[
                  {
                    label: "Tambah Kegiatan Baru",
                    icon: "add",
                    onClick: () => setModal({ mode: "add", kegiatan: null }),
                  },
                  {
                    label: "Import Excel",
                    icon: "upload",
                    onClick: () => excelImportRef.current?.click(),
                  },
                  {
                    label: "Export Excel",
                    icon: "download",
                    onClick: handleExport,
                    variant: "success",
                  },
                ]}
              />
              <input ref={excelImportRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </div>
          </div>

          {/* Kegiatan Cards List */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/15">
                <Icon name="event_busy" className="text-5xl text-on-surface-variant/20 mb-3 mx-auto" />
                <p className="text-sm font-semibold text-primary">Tidak ada kegiatan ditemukan</p>
                <p className="text-xs text-on-surface-variant/50 mt-1">Coba sesuaikan kata kunci pencarian atau buat kegiatan baru.</p>
              </div>
            )}

            {filtered.map((k) => {
              const isExpanded = expandedId === k.id
              const cfg = STATUS_CONFIG[k.status]
              return (
                <div key={k.id} className={`rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${isExpanded ? "border-secondary/30 bg-surface-container-lowest shadow-md ring-1 ring-secondary/10" : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30"}`}>
                  {/* Clickable Header Row */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedId(isExpanded ? null : k.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setExpandedId(isExpanded ? null : k.id)
                      }
                    }}
                    className="p-4 sm:p-5 bg-surface-container-lowest flex items-start sm:items-center gap-3.5 cursor-pointer select-none"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${cfg.activeBg} border ${cfg.border} flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon name={cfg.icon} filled className={`${cfg.color} !text-base`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-primary font-display truncate">{k.title}</h3>
                        {k.proposal && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                            <Icon name="attach_file" size="sm" className="!text-[10px]" />
                            Proposal
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant/60 flex-wrap">
                        <span className="font-semibold text-secondary">{k.division}</span>
                        <span className="opacity-30">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="calendar_today" size="sm" className="!text-[10px] text-on-surface-variant/40" />
                          {formatDate(k.date)}
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="location_on" size="sm" className="!text-[10px] text-on-surface-variant/40" />
                          {k.location}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge + Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${cfg.activeBg} ${cfg.color} ${cfg.border}`}>
                        <Icon name={cfg.icon} size="sm" className="!text-xs" filled />
                        <span>{cfg.label}</span>
                      </span>
                      <Icon name={isExpanded ? "expand_less" : "expand_more"} size="sm" className="text-on-surface-variant/40" />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 bg-surface-container-low/40 border-t border-outline-variant/10">
                      <div className="pt-4 space-y-4">
                        {k.description && <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 text-xs text-on-surface-variant/80 leading-relaxed">{k.description}</div>}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-0.5">Penanggung Jawab (PIC)</span>
                            <span className="font-bold text-primary">{k.pic || "-"}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-0.5">Estimasi Anggaran</span>
                            <span className="font-bold text-primary font-mono">{k.budget || "-"}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-0.5">Tanggal Dibuat</span>
                            <span className="font-medium text-primary">{formatDate(k.createdAt)}</span>
                          </div>
                        </div>

                        {k.notes && (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700 block mb-1">Catatan Khusus</span>
                            <p>{k.notes}</p>
                          </div>
                        )}

                        {/* Proposal Uploader & Manager */}
                        <ProposalUploader kegiatan={k} />

                        {/* Action Controls */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => setModal({ mode: "edit", kegiatan: k })}>
                            <Icon name="edit" size="sm" className="!text-xs" />
                            <span>Edit Kegiatan</span>
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteTargetKegiatan(k)}>
                            <Icon name="delete" size="sm" className="!text-xs" />
                            <span>Hapus</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <KegiatanModal
          kegiatan={modal.kegiatan}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            try {
              if (modal.mode === "edit" && modal.kegiatan) {
                await updateKegiatan(modal.kegiatan.id, data)
                toast.success("Kegiatan berhasil diperbarui!")
              } else {
                await addKegiatan(data as Omit<Kegiatan, "id" | "createdAt">)
                toast.success("Kegiatan baru berhasil ditambahkan!")
              }
              setModal(null)
            } catch (e: any) {
              toast.error(e?.response?.data?.message || "Gagal menyimpan kegiatan.")
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetKegiatan)}
        onClose={() => setDeleteTargetKegiatan(null)}
        onConfirm={async () => {
          if (deleteTargetKegiatan) {
            try {
              await removeKegiatan(deleteTargetKegiatan.id)
              toast.success(`Kegiatan "${deleteTargetKegiatan.title}" berhasil dihapus.`)
            } catch (e) {
              toast.error("Gagal menghapus kegiatan.")
            }
            setDeleteTargetKegiatan(null)
          }
        }}
        title="Hapus Agenda Kegiatan"
        message={`Apakah Anda yakin ingin menghapus agenda kegiatan "${deleteTargetKegiatan?.title}"? Dokumen proposal dan detail kegiatan ini akan ikut dihapus.`}
        confirmText="Hapus Kegiatan"
        variant="danger"
      />
    </>
  )
}
