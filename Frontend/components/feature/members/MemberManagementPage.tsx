"use client";
import { useState, useEffect, useRef } from "react";
import MemberModal from "./MemberModal";
import { toast } from "@/stores/toast.store";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ActionMenu from "@/components/ui/ActionMenu";
import { useHydrated } from "@/hooks/useHydrated";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import { useMemberStore, type AppMember } from "@/stores/member.store";
import { exportToExcel, importFromExcel, MEMBERS_COLUMNS } from "@/lib/excel";

export default function MemberManagementPage() {
  const { members, fetchMembers, addMember, updateMember, removeMember, toggleActive } = useMemberStore();
  const hydrated = useHydrated();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; member: AppMember | null } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleExport = () => {
    const exportData = members.map((m) => ({
      name: m.name,
      division: m.division || "",
      angkatan: m.angkatan,
      is_active: m.is_active ? "Aktif" : "Nonaktif",
    }));
    exportToExcel(exportData, MEMBERS_COLUMNS, "data_anggota_mdptv");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importFromExcel(file, MEMBERS_COLUMNS);
      const divRes = await import("@/lib/axios").then((mod) => mod.default.get("/divisions"));
      const divList: { id: string; name: string }[] = divRes.data?.data || [];

      let imported = 0;
      for (const row of rows) {
        if (!row.name || !row.angkatan) continue;
        let divId: string | undefined = undefined;
        if (row.division) {
          const matched = divList.find((d) => d.name.toLowerCase() === row.division.toLowerCase());
          if (matched) divId = matched.id;
        }

        await addMember({
          full_name: row.name,
          angkatan: parseInt(row.angkatan) || new Date().getFullYear(),
          is_active: row.is_active?.toLowerCase() === "aktif",
          division_id: divId as any,
        });
        imported++;
      }
      toast.success(`Berhasil import ${imported} anggota`);
    } catch (error) {
      toast.error("Gagal membaca file Excel atau data tidak valid.");
    }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = members.filter((m) => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? m.is_active : !m.is_active);
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: members.length,
    active: members.filter(m => m.is_active).length,
    inactive: members.filter(m => !m.is_active).length,
  };


  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Data Anggota
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        Daftar nama dan angkatan
      </p>
    </div>
  );

  return (
    <>
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      <header className="sticky top-[68px] lg:top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-start lg:justify-between overflow-x-auto hide-scrollbar px-4 sm:px-8 py-3 lg:py-4">
          <div className="hidden lg:block">
            <h2 className="text-base sm:text-xl font-bold text-primary">Data Anggota</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Daftar nama dan angkatan untuk diregistrasikan di Absensi</p>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border bg-surface-container-low border-outline-variant/20 hover:scale-[1.01] hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-surface-container-highest group-hover:bg-white/50">
                <Icon name="groups" filled className="text-secondary !text-base sm:!text-xl" />
              </div>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-widest font-bold text-on-surface-variant/50">Total Anggota</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-primary">{counts.total}</div>
          </div>

          <div className="group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border bg-green-50/50 border-green-200/50 hover:scale-[1.01] hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-green-50 group-hover:bg-white/50">
                <Icon name="check_circle" filled className="text-green-500 !text-base sm:!text-xl" />
              </div>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-widest font-bold text-green-600/70">Aktif</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-primary">{counts.active}</div>
          </div>

          <div className="group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border bg-red-50/50 border-red-200/50 hover:scale-[1.01] hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-red-50 group-hover:bg-white/50">
                <Icon name="cancel" filled className="text-red-500 !text-base sm:!text-xl" />
              </div>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-widest font-bold text-red-600/70">Nonaktif</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-primary">{counts.inactive}</div>
          </div>
        </div>

        {/* Toolbar: Search, Filter & Actions */}
        <div className="mb-6 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Icon name="search" size="sm" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-sm focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
              placeholder="Cari anggota..." />
          </div>

          {/* Menus */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Menu */}
            <ActionMenu 
              triggerIcon="filter_list" 
              title="Saring Status"
              actions={[
                { label: "Semua Status", icon: "list", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
                { label: "Aktif", icon: "check_circle", active: statusFilter === "active", onClick: () => setStatusFilter("active") },
                { label: "Nonaktif", icon: "cancel", active: statusFilter === "inactive", onClick: () => setStatusFilter("inactive") },
            ]} />

            <ActionMenu actions={[
              { label: "Tambah Anggota", icon: "person_add", onClick: () => setModal({ mode: "add", member: null }) },
              { label: "Import Excel", icon: "upload", onClick: () => importRef.current?.click() },
              { label: "Export Excel", icon: "download", onClick: handleExport, variant: "success" },
            ]} />
            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </div>
        </div>

        {/* Member List */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Icon name="person_off" className="text-5xl text-on-surface-variant/20 mb-3" />
              <p className="text-sm text-on-surface-variant/40">Tidak ada anggota ditemukan</p>
            </div>
          )}

          {filtered.map((m) => (
              <div key={m.id} className="p-4 sm:p-5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex items-center gap-3 sm:gap-4 hover:border-outline-variant/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-primary truncate">{m.name}</h3>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                      Angkatan: {m.angkatan}
                    </span>
                    {!m.is_active && (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-500">Nonaktif</span>
                    )}
                  </div>
                  <div className="text-xs text-on-surface-variant/60 mt-1">
                     {m.division || "Tanpa Divisi"}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                   <Button variant="icon" size="icon" onClick={() => toggleActive(m.id)}
                    className={m.is_active ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50"}
                    title={m.is_active ? "Nonaktifkan" : "Aktifkan"}>
                    <Icon name={m.is_active ? "toggle_on" : "toggle_off"} size="sm" />
                  </Button>
                  <Button variant="icon" size="icon" onClick={() => setModal({ mode: "edit", member: m })} title="Edit">
                    <Icon name="edit" size="sm" />
                  </Button>
                  <Button variant="icon" size="icon" onClick={() => { if (confirm(`Hapus anggota "${m.name}"?`)) removeMember(m.id); }}
                      className="hover:bg-red-50 hover:text-red-500 text-on-surface-variant/40" title="Hapus">
                      <Icon name="delete" size="sm" />
                  </Button>
                </div>
              </div>
          ))}
        </div>
      </div>

      {modal && (
        <MemberModal
          member={modal.member}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            const mappedData = {
               full_name: data.name,
               division_id: data.division_id && data.division_id !== "" ? data.division_id : undefined,
               angkatan: data.angkatan || new Date().getFullYear(),
               is_active: data.is_active
            };
            if (modal.mode === "edit" && modal.member) {
              await updateMember(modal.member.id, mappedData as any);
            } else {
              await addMember(mappedData as any);
            }
            setModal(null);
          }}
        />
      )}
    </>
  );
}
