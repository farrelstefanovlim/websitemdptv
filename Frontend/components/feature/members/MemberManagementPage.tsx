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
  const [categoryFilter, setCategoryFilter] = useState<"all" | "core" | "regular">("all");
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleExport = () => {
    const exportData = members.map((m) => ({
      name: m.name,
      division: m.division || "Umum",
      category: m.is_core ? "Pengurus Inti" : "Anggota Biasa",
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

        const isCore =
          row.category?.toLowerCase().includes("inti") ||
          row.category?.toLowerCase().includes("core");

        await addMember({
          full_name: row.name,
          angkatan: parseInt(row.angkatan) || new Date().getFullYear(),
          is_core: isCore,
          is_active: row.is_active?.toLowerCase() !== "nonaktif",
          division_id: divId,
        });
        imported++;
      }
      toast.success(`Berhasil import ${imported} data anggota`);
    } catch {
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
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      String(m.angkatan).includes(search) ||
      (m.division && m.division.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active" ? m.is_active : !m.is_active);

    const matchesCategory =
      categoryFilter === "all" || (categoryFilter === "core" ? m.is_core : !m.is_core);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const counts = {
    total: members.length,
    core: members.filter((m) => m.is_core).length,
    active: members.filter((m) => m.is_active).length,
    inactive: members.filter((m) => !m.is_active).length,
  };

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Data Anggota
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        Daftar anggota, pengurus inti, dan angkatan
      </p>
    </div>
  );

  return (
    <>
      {hydrated && mobileTitlePortalTarget && createPortal(topbarTitle, mobileTitlePortalTarget)}

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 sm:p-5 rounded-3xl border bg-surface-container-low border-outline-variant/15">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Icon name="groups" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">
                Total Anggota
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-display">
              {counts.total}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
                <Icon name="star" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-700">
                Pengurus Inti
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 font-display">
              {counts.core}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                <Icon name="check_circle" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                Aktif
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">
              {counts.active}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border bg-rose-500/5 border-rose-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600">
                <Icon name="cancel" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-rose-700">
                Nonaktif
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-950 font-display">
              {counts.inactive}
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filter & Actions */}
        <div className="mb-6 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Icon
              name="search"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-sm focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/40"
              placeholder="Cari nama anggota, divisi, atau angkatan..."
            />
          </div>

          {/* Menus */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Menu */}
            <ActionMenu
              triggerIcon="filter_list"
              title="Saring Anggota"
              actions={[
                { type: "header", label: "Kategori Kepengurusan" },
                {
                  label: "Semua Kategori",
                  icon: "list",
                  active: categoryFilter === "all",
                  onClick: () => setCategoryFilter("all"),
                },
                {
                  label: "⭐ Pengurus Inti",
                  icon: "star",
                  active: categoryFilter === "core",
                  onClick: () => setCategoryFilter("core"),
                },
                {
                  label: "Anggota Biasa",
                  icon: "person",
                  active: categoryFilter === "regular",
                  onClick: () => setCategoryFilter("regular"),
                },
                { type: "divider" },
                { type: "header", label: "Status Keaktifan" },
                {
                  label: "Semua Status",
                  icon: "list",
                  active: statusFilter === "all",
                  onClick: () => setStatusFilter("all"),
                },
                {
                  label: "Aktif",
                  icon: "check_circle",
                  active: statusFilter === "active",
                  onClick: () => setStatusFilter("active"),
                },
                {
                  label: "Nonaktif",
                  icon: "cancel",
                  active: statusFilter === "inactive",
                  onClick: () => setStatusFilter("inactive"),
                },
              ]}
            />

            <ActionMenu
              actions={[
                {
                  label: "Tambah Anggota",
                  icon: "person_add",
                  onClick: () => setModal({ mode: "add", member: null }),
                },
                {
                  label: "Import Excel",
                  icon: "upload",
                  onClick: () => importRef.current?.click(),
                },
                {
                  label: "Export Excel",
                  icon: "download",
                  onClick: handleExport,
                  variant: "success",
                },
              ]}
            />
            <input
              ref={importRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Member List Cards */}
        <div className="flex flex-col gap-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/15">
              <Icon name="person_off" className="text-5xl text-on-surface-variant/20 mb-3 mx-auto" />
              <p className="text-sm font-semibold text-primary">Tidak ada anggota ditemukan</p>
              <p className="text-xs text-on-surface-variant/50 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
            </div>
          )}

          {filtered.map((m) => (
            <div
              key={m.id}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-between gap-3 sm:gap-4 transition-all ${
                m.is_core
                  ? "bg-amber-500/[0.03] border-amber-500/25 shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant/15 hover:border-outline-variant/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold text-primary truncate">
                    {m.name}
                  </h3>

                  {/* Core Badge */}
                  {m.is_core ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-700 border border-amber-500/25">
                      <Icon name="star" filled size="sm" className="!text-[10px]" />
                      Pengurus Inti
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-surface-container-high text-on-surface-variant/60">
                      Anggota
                    </span>
                  )}

                  {/* Angkatan / Tahun Masuk Badge */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                    Angkatan: {m.angkatan}
                  </span>

                  {/* Status Nonaktif Badge */}
                  {!m.is_active && (
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-on-surface-variant/60 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="diversity_3" size="sm" className="!text-xs text-on-surface-variant/40" />
                    {m.division || "Divisi Umum"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => toggleActive(m.id)}
                  className={
                    m.is_active
                      ? "text-emerald-500 hover:bg-emerald-50"
                      : "text-rose-400 hover:bg-rose-50"
                  }
                  title={m.is_active ? "Nonaktifkan Anggota" : "Aktifkan Anggota"}
                >
                  <Icon name={m.is_active ? "toggle_on" : "toggle_off"} size="sm" />
                </Button>

                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => setModal({ mode: "edit", member: m })}
                  title="Edit Data Anggota"
                >
                  <Icon name="edit" size="sm" />
                </Button>

                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Hapus anggota "${m.name}"?`)) removeMember(m.id);
                  }}
                  className="hover:bg-rose-50 hover:text-rose-600 text-on-surface-variant/40"
                  title="Hapus Anggota"
                >
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
              is_core: data.is_core ?? false,
              is_active: data.is_active ?? true,
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
