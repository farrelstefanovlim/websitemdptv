"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { useKegiatanStore, type Kegiatan, type KegiatanStatus, type ProposalFile } from "@/stores/kegiatan.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, KEGIATAN_COLUMNS } from "@/lib/excel";

const STATUS_CONFIG: Record<KegiatanStatus, { label: string; color: string; bg: string; icon: string }> = {
  draft: { label: "Draft", color: "text-on-surface-variant", bg: "bg-on-surface-variant/10", icon: "edit_note" },
  diajukan: { label: "Diajukan", color: "text-blue-600", bg: "bg-blue-50", icon: "send" },
  disetujui: { label: "Disetujui", color: "text-green-600", bg: "bg-green-50", icon: "check_circle" },
  ditolak: { label: "Ditolak", color: "text-red-500", bg: "bg-red-50", icon: "cancel" },
  selesai: { label: "Selesai", color: "text-purple-600", bg: "bg-purple-50", icon: "verified" },
};

const ALL_STATUSES: KegiatanStatus[] = ["draft", "diajukan", "disetujui", "ditolak", "selesai"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Add/Edit Modal ───────────────────────────────── */

function KegiatanModal({ kegiatan, onClose, onSave }: {
  kegiatan: Kegiatan | null;
  onClose: () => void;
  onSave: (data: Partial<Kegiatan>) => void;
}) {
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

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{kegiatan ? "Edit Kegiatan" : "Tambah Kegiatan"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-all">
            <Icon name="close" size="sm" />
          </button>
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
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Divisi</label>
              <select value={form.division} onChange={(e) => set("division", e.target.value)} className={inputCls}>
                <option>Photography & Videography</option>
                <option>Graphic Design</option>
                <option>Kominfo</option>
                <option>All Division</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Tanggal</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
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
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Catatan</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Catatan tambahan..." />
          </div>
        </div>
        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-outline-variant/25 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all">
            Batal
          </button>
          <button onClick={() => { if (form.title.trim()) onSave(form); }}
            className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40"
            disabled={!form.title.trim()}>
            {kegiatan ? "Simpan" : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Proposal Upload within kegiatan card ──────────── */

function ProposalUploader({ kegiatan }: { kegiatan: Kegiatan }) {
  const { setProposal } = useKegiatanStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Ukuran file maksimal 5MB"); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const pf: ProposalFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      setProposal(kegiatan.id, pf);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadFile = () => {
    if (!kegiatan.proposal) return;
    const a = document.createElement("a");
    a.href = kegiatan.proposal.data;
    a.download = kegiatan.proposal.name;
    a.click();
  };

  return (
    <div className="mt-3 pt-3 border-t border-outline-variant/10">
      <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-2">Proposal</span>

      {kegiatan.proposal ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/15">
          <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0">
            <Icon name="description" filled className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">{kegiatan.proposal.name}</p>
            <p className="text-[10px] text-on-surface-variant/50">{formatSize(kegiatan.proposal.size)} • {formatDate(kegiatan.proposal.uploadedAt)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={downloadFile}
              className="w-8 h-8 rounded-lg hover:bg-secondary/15 flex items-center justify-center text-secondary transition-all" title="Download">
              <Icon name="download" size="sm" />
            </button>
            <button onClick={() => setProposal(kegiatan.id, null)}
              className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-error/50 hover:text-error transition-all" title="Hapus">
              <Icon name="delete" size="sm" />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()}
          className="w-full p-4 rounded-xl border-2 border-dashed border-outline-variant/25 hover:border-secondary/40 hover:bg-secondary/3 flex flex-col items-center gap-2 transition-all group cursor-pointer"
          disabled={uploading}>
          {uploading ? (
            <div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="cloud_upload" className="text-2xl text-on-surface-variant/30 group-hover:text-secondary transition-colors" />
              <span className="text-xs text-on-surface-variant/50 group-hover:text-secondary/80 transition-colors">Upload Proposal (PDF, DOC, max 5MB)</span>
            </>
          )}
        </button>
      )}
      <input ref={fileRef} type="file" onChange={handleFile} accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" />
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────── */

export default function KegiatanPage() {
  const { items, addKegiatan, updateKegiatan, removeKegiatan } = useKegiatanStore();
  const hydrated = useHydrated();
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

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">Kegiatan</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Kelola kegiatan & upload proposal</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={handleExport}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
              title="Export ke Excel">
              <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={() => excelImportRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              title="Import dari Excel">
              <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
            </button>
            <input ref={excelImportRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            <button onClick={() => setModal({ mode: "add", kegiatan: null })}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl bg-secondary text-on-secondary hover:brightness-110 transition-all duration-300">
              <Icon name="add" size="sm" /> <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-6">
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${statusFilter === s ? "border-secondary/30 bg-secondary/5 shadow-sm" : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30"}`}>
                <Icon name={cfg.icon} filled className={`${cfg.color} !text-lg mb-1`} />
                <div className="text-xl sm:text-2xl font-black text-primary">{counts[s]}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">{cfg.label}</div>
              </button>
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
            <button onClick={() => setStatusFilter("all")} className="text-[10px] text-secondary font-bold hover:underline ml-1">Clear</button>
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
                        <button onClick={() => setModal({ mode: "edit", kegiatan: k })}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-outline-variant/20 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-secondary/8 hover:text-secondary hover:border-secondary/25 transition-all">
                          <Icon name="edit" size="sm" className="!text-xs" /> Edit
                        </button>
                        <button onClick={() => { if (confirm("Hapus kegiatan ini?")) removeKegiatan(k.id); }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-outline-variant/20 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all">
                          <Icon name="delete" size="sm" className="!text-xs" /> Hapus
                        </button>
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
