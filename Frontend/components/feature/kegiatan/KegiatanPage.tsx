"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import { useKegiatanStore, type Kegiatan, type KegiatanStatus } from "@/stores/kegiatan.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, KEGIATAN_COLUMNS } from "@/lib/excel";
import { toast } from "@/stores/toast.store";
import Button from "@/components/ui/Button";
import KegiatanModal from "./KegiatanModal";
import ProposalUploader from "./ProposalUploader";
import ActionMenu from "@/components/ui/ActionMenu";
import { STATUS_CONFIG, ALL_STATUSES, formatDate } from "./utils";

/* ── Add/Edit Modal ───────────────────────────────── */



/* ── Main Page ─────────────────────────────────────── */

export default function KegiatanPage() {
  const { items, addKegiatan, updateKegiatan, removeKegiatan, fetchKegiatan } = useKegiatanStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const [statusFilter, setStatusFilter] = useState<KegiatanStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; kegiatan: Kegiatan | null } | null>(null);
  const excelImportRef = useRef<HTMLInputElement>(null);

  // Fetch data dari API saat mount
  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  const handleExport = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportToExcel(items as any[], KEGIATAN_COLUMNS, "kegiatan_mdptv", "Kegiatan");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importFromExcel(
        file,
        KEGIATAN_COLUMNS
      );
      let imported = 0;
      for (const row of rows) {
        if (!row.title) continue;
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
        });
        imported++;
      }
      toast.success(`Berhasil import ${imported} kegiatan`);
    } catch { toast.error("Gagal membaca file Excel"); }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const counts = ALL_STATUSES.reduce((acc, s) => ({ ...acc, [s]: items.filter((k) => k.status === s).length }), {} as Record<KegiatanStatus, number>);

  const filtered = items.filter((k) => {
    const matchesFilter = statusFilter === "all" || k.status === statusFilter;
    const s = search.toLowerCase();
    const matchesSearch = k.title.toLowerCase().includes(s) || k.division.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });


  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Kegiatan
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        Kelola kegiatan & upload proposal
      </p>
    </div>
  );

  return (
    <>
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      {/* Top Bar */}
      <header className="sticky top-[68px] lg:top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-start lg:justify-between overflow-x-auto hide-scrollbar px-4 sm:px-8 py-3 lg:py-4">
          <div className="hidden lg:block shrink-0">
            <h2 className="text-base sm:text-xl font-bold text-primary">Kegiatan</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Kelola kegiatan & upload proposal</p>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-6">
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s}
                className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border ${cfg.bg} ${cfg.border} hover:scale-[1.02] hover:shadow-sm transition-all duration-300`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-white/40 group-hover:bg-white/70">
                    <Icon name={cfg.icon} size="sm" className={`${cfg.color} !text-base sm:!text-xl`} />
                  </div>
                  <span className={`text-[9px] sm:text-[11px] uppercase tracking-widest font-bold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="text-2xl sm:text-4xl font-black text-primary">
                  {counts[s]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar: Search, Filter & Actions */}
        <div className="mb-6 flex items-center gap-2 w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Icon name="search" size="sm" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-sm focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
              placeholder="Cari kegiatan..." />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Menu */}
            <ActionMenu 
              triggerIcon="filter_list" 
              title="Saring Kegiatan"
              actions={[
              { label: "Semua", icon: "list", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
              ...ALL_STATUSES.map(s => ({
                label: STATUS_CONFIG[s].label,
                icon: STATUS_CONFIG[s].icon,
                active: statusFilter === s,
                onClick: () => setStatusFilter(s)
              }))
            ]} />
            
            {/* Actions Menu */}
            <ActionMenu actions={[
              { label: "Tambah Kegiatan", icon: "add", onClick: () => setModal({ mode: "add", kegiatan: null }) },
              { label: "Import Excel", icon: "upload", onClick: () => excelImportRef.current?.click() },
              { label: "Export Excel", icon: "download", onClick: handleExport, variant: "success" },
            ]} />
            <input ref={excelImportRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </div>
        </div>

        {/* Kegiatan List */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Icon name="event_busy" className="text-5xl text-on-surface-variant/20 mb-3" />
              <p className="text-sm text-on-surface-variant/40">Tidak ada kegiatan</p>
            </div>
          )}

          {filtered.map((k) => {
            const isExpanded = expandedId === k.id;
            const cfg = STATUS_CONFIG[k.status];
            return (
              <div key={k.id} className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? "border-secondary/20 shadow-lg" : "border-outline-variant/15"}`}>
                {/* Row */}
                <div role="button" tabIndex={0} onClick={() => setExpandedId(isExpanded ? null : k.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isExpanded ? null : k.id); } }}
                  className="p-4 sm:p-5 bg-surface-container-lowest flex items-start sm:items-center gap-3 cursor-pointer select-none">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${cfg.activeBg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                    <Icon name={cfg.icon} filled className={`${cfg.color} !text-lg`} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-primary truncate">{k.title}</h3>
                      {k.proposal && <Icon name="attach_file" size="sm" className="text-secondary/60 !text-sm" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-xs text-on-surface-variant/50 flex-wrap">
                      <span>{k.division}</span>
                      <span className="opacity-30">•</span>
                      <span>{formatDate(k.date)}</span>
                      <span className="opacity-30">•</span>
                      <span>{k.location}</span>
                    </div>
                  </div>
                  {/* Status badge + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.activeBg} ${cfg.color} ${cfg.border}`}>
                      <Icon name={cfg.icon} size="sm" className="!text-xs" /> {cfg.label}
                    </span>
                    <Icon name={isExpanded ? "expand_less" : "expand_more"} size="sm" className="text-on-surface-variant/30" />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 bg-surface-container-low/50 border-t border-outline-variant/10">
                    <div className="pt-4 grid gap-3">
                      {/* Mobile status badge */}
                      <div className="sm:hidden">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.activeBg} ${cfg.color} ${cfg.border}`}>
                          <Icon name={cfg.icon} size="sm" className="!text-xs" /> {cfg.label}
                        </span>
                      </div>

                      {/* Description */}
                      {k.description && (
                        <p className="text-sm text-on-surface-variant/70 leading-relaxed">{k.description}</p>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-0.5">PIC</span>
                          <span className="font-medium text-primary">{k.pic || "-"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-0.5">Anggaran</span>
                          <span className="font-medium text-primary">{k.budget || "-"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-0.5">Dibuat</span>
                          <span className="font-medium text-primary">{formatDate(k.createdAt)}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {k.notes && (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/30">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-amber-600/60 block mb-1">Catatan</span>
                          <p className="text-sm text-amber-800/70">{k.notes}</p>
                        </div>
                      )}

                      {/* Proposal Uploader */}
                      <ProposalUploader kegiatan={k} />

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="none" onClick={() => setModal({ mode: "edit", kegiatan: k })}
                          className="px-3 py-2 text-[10px] text-on-surface-variant">
                          <Icon name="edit" size="sm" className="!text-xs" /> Edit
                        </Button>
                        <Button variant="danger" size="none" onClick={() => { if (confirm("Hapus kegiatan ini?")) removeKegiatan(k.id); }}
                          className="px-3 py-2 text-[10px]">
                          <Icon name="delete" size="sm" className="!text-xs" /> Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <KegiatanModal
          kegiatan={modal.kegiatan}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.mode === "edit" && modal.kegiatan) {
              updateKegiatan(modal.kegiatan.id, data);
            } else {
              addKegiatan(data as Omit<Kegiatan, "id" | "createdAt">);
            }
            setModal(null);
          }}
        />
      )}
    </>
  );
}
