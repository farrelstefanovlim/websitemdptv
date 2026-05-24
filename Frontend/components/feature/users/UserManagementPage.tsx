"use client";
import { useState, useRef, useEffect } from "react";
import UserModal from "@/components/feature/users/UserModal";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ActionMenu from "@/components/ui/ActionMenu";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import { useUserStore, type AppUser, type UserRole, ROLE_CONFIG } from "@/stores/user.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel } from "@/lib/excel";
import { toast } from "@/stores/toast.store";

const ALL_ROLES: UserRole[] = ["superadmin", "admin"];

const USER_COLUMNS = [
  { key: "username", header: "Username" },
  { key: "fullName", header: "Nama Lengkap" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "isActive", header: "Aktif" },
  { key: "createdAt", header: "Dibuat" },
  { key: "lastLogin", header: "Login Terakhir" },
];

/* ── Main Page ─────────────────────────────────────── */

export default function UserManagementPage() {
  const { users, addUser, updateUser, removeUser, toggleActive, fetchUsers } = useUserStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; user: AppUser | null } | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  // Fetch data dari API saat mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleExport = () => {
    const exportData = users.map((u) => ({ ...u, isActive: u.isActive ? "Ya" : "Tidak", lastLogin: u.lastLogin || "-" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportToExcel(exportData as any[], USER_COLUMNS, "users_mdptv", "Users");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importFromExcel(file, USER_COLUMNS);
      let imported = 0;
      for (const row of rows) {
        if (!row.username || !row.fullName) continue;
        addUser({
          username: row.username,
          fullName: row.fullName,
          email: row.email || "",
          role: (ALL_ROLES.includes(row.role as UserRole) ? row.role : "admin") as UserRole,
          password: "default123",
          isActive: true,
        });
        imported++;
      }
      toast.success(`Berhasil import ${imported} user (password default: default123)`);
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

  const filtered = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter((u) => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    ...ALL_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {} as Record<UserRole, number>),
  };


  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Manajemen User
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        Kelola akun pengguna & hak akses
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
            <h2 className="text-base sm:text-xl font-bold text-primary">Manajemen User</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Kelola akun pengguna & hak akses</p>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <div className="group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border bg-surface-container-low border-outline-variant/20 hover:scale-[1.01] hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors bg-surface-container-highest group-hover:bg-white/50">
                <Icon name="groups" filled className="text-secondary !text-base sm:!text-xl" />
              </div>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-widest font-bold text-on-surface-variant/50">Total User</span>
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

          {ALL_ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            const isActive = roleFilter === r;
            return (
              <div key={r}
                className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 border transition-all duration-300 text-left bg-surface-container-low border-outline-variant/20 hover:scale-[1.01] hover:shadow-sm`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${isActive ? 'bg-white/60 shadow-sm' : `${cfg.activeBg} group-hover:bg-white/50`}`}>
                    <Icon name={cfg.icon} size="sm" className={`${cfg.color} !text-base sm:!text-xl`} filled={isActive} />
                  </div>
                  <span className={`text-[9px] sm:text-[11px] uppercase tracking-widest font-bold ${isActive ? cfg.color : 'text-on-surface-variant/50'}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className={`text-2xl sm:text-4xl font-black text-primary`}>
                  {(counts as Record<string, number>)[r] || 0}
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
              placeholder="Cari nama atau username..." />
          </div>

          {/* Menus */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Menu */}
            <ActionMenu 
              triggerIcon="filter_list" 
              title="Saring Role"
              actions={[
                { label: "Semua Role", icon: "list", active: roleFilter === "all", onClick: () => setRoleFilter("all") },
                ...ALL_ROLES.map(r => ({
                  label: ROLE_CONFIG[r].label,
                  icon: ROLE_CONFIG[r].icon,
                  active: roleFilter === r,
                  onClick: () => setRoleFilter(r)
                }))
            ]} />

            {/* Actions Menu */}
            <ActionMenu actions={[
              { label: "Tambah User", icon: "person_add", onClick: () => setModal({ mode: "add", user: null }) },
              { label: "Import Excel", icon: "upload", onClick: () => importRef.current?.click() },
              { label: "Export Excel", icon: "download", onClick: handleExport, variant: "success" },
            ]} />
            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </div>
        </div>

        {/* User List */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Icon name="person_off" className="text-5xl text-on-surface-variant/20 mb-3" />
              <p className="text-sm text-on-surface-variant/40">Tidak ada user ditemukan</p>
            </div>
          )}

          {filtered.map((u) => {
            const roleCfg = ROLE_CONFIG[u.role];
            return (
              <div key={u.id}
                className="p-4 sm:p-5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex items-center gap-3 sm:gap-4 hover:border-outline-variant/30 transition-all">
                {/* Avatar */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${roleCfg.activeBg} border ${roleCfg.border} flex items-center justify-center shrink-0 relative`}>
                  <Icon name={roleCfg.icon} filled className={`${roleCfg.color} !text-lg sm:!text-xl`} />
                  {!u.isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                      <Icon name="close" size="sm" className="!text-[8px] text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-primary truncate">{u.fullName}</h3>
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleCfg.activeBg} ${roleCfg.border} ${roleCfg.color}`}>
                      {roleCfg.label}
                    </span>
                    {!u.isActive && (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-500">Nonaktif</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-xs text-on-surface-variant/50 flex-wrap">
                    <span>@{u.username}</span>
                    <span className="opacity-30">•</span>
                    <span>{u.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="icon" size="icon" onClick={() => toggleActive(u.id)}
                    className={u.isActive ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50"}
                    title={u.isActive ? "Nonaktifkan" : "Aktifkan"}>
                    <Icon name={u.isActive ? "toggle_on" : "toggle_off"} size="sm" />
                  </Button>
                  <Button variant="icon" size="icon" onClick={() => setModal({ mode: "edit", user: u })}
                    title="Edit">
                    <Icon name="edit" size="sm" />
                  </Button>
                  {u.role !== "superadmin" && (
                    <Button variant="icon" size="icon" onClick={() => { if (confirm(`Hapus user "${u.fullName}"?`)) removeUser(u.id); }}
                      className="hover:bg-red-50 hover:text-red-500 text-on-surface-variant/40"
                      title="Hapus">
                      <Icon name="delete" size="sm" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <UserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            if (modal.mode === "edit" && modal.user) {
              updateUser(modal.user.id, data);
            } else {
              await addUser(data as Omit<AppUser, "id" | "createdAt" | "lastLogin">);
            }
            setModal(null);
          }}
        />
      )}
    </>
  );
}
