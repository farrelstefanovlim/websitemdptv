"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import { useKegiatanStore, type Kegiatan, type KegiatanStatus } from "@/stores/kegiatan.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, KEGIATAN_COLUMNS } from "@/lib/excel";
import Button from "@/components/ui/Button";
import KegiatanModal from "./KegiatanModal";
import ProposalUploader from "./ProposalUploader";
import { STATUS_CONFIG, ALL_STATUSES, formatDate } from "./utils";

/* ── Add/Edit Modal ───────────────────────────────── */



/* ── Main Page ─────────────────────────────────────── */

export default function KegiatanPage() {
  const { items, addKegiatan, updateKegiatan, removeKegiatan } = useKegiatanStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const [statusFilter, setStatusFilter] = useState<KegiatanStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; kegiatan: Kegiatan | null } | null>(null);
  const excelImportRef = useRef<HTMLInputElement>(null);

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
      alert(`Berhasil import ${imported} kegiatan`);
    } catch { alert("Gagal membaca file Excel"); }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = statusFilter === "all" ? items : items.filter((k) => k.status === statusFilter);
  const counts = ALL_STATUSES.reduce((acc, s) => ({ ...acc, [s]: items.filter((k) => k.status === s).length }), {} as Record<KegiatanStatus, number>);

  const mobileActions = (
    <>
      <Button variant="success" size="none" onClick={handleExport} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="download" size="sm" />
      </Button>
      <Button variant="outline" size="none" onClick={() => excelImportRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="upload" size="sm" />
      </Button>
      <input ref={excelImportRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
      <Button variant="primary" size="none" onClick={() => setModal({ mode: "add", kegiatan: null })} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="add" size="sm" />
      </Button>
    </>
  );

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
      {hydrated && portalTarget && createPortal(mobileActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      {/* Top Bar */}
      <header className="hidden lg:block sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">Kegiatan</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Kelola kegiatan & upload proposal</p>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            <Button size="sm" variant="success" onClick={handleExport} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs">
              <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => excelImportRef.current?.click()} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs">
              <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
            </Button>
            <input ref={excelImportRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            <Button size="sm" variant="primary" onClick={() => setModal({ mode: "add", kegiatan: null })} className="px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs">
              <Icon name="add" size="sm" /> <span className="hidden sm:inline">Tambah</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-6">
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <Button key={s} size="none" variant="ghost" onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all justify-start items-start flex-col ${statusFilter === s ? "border-secondary/30 bg-secondary/5 shadow-sm" : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30"}`}>
                <Icon name={cfg.icon} filled className={`${cfg.color} !text-lg mb-1`} />
                <div className="text-xl sm:text-2xl font-black text-primary">{counts[s]}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">{cfg.label}</div>
              </Button>
            );
          })}
        </div>

        {/* Filter indicator */}
        {statusFilter !== "all" && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-on-surface-variant/50">Filter:</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[statusFilter].bg} ${STATUS_CONFIG[statusFilter].color}`}>
              {STATUS_CONFIG[statusFilter].label}
            </span>
            <Button size="none" variant="ghost" onClick={() => setStatusFilter("all")} className="text-[10px] text-secondary font-bold hover:underline ml-1">Clear</Button>
          </div>
        )}

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
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
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
                    <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
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
