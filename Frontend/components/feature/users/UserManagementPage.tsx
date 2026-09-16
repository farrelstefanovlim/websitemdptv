"use client";

import { useState, useRef, useEffect } from "react";
import UserModal from "@/components/feature/users/UserModal";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
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

export default function UserManagementPage() {
  const { users, addUser, updateUser, removeUser, toggleActive, fetchUsers } = useUserStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; user: AppUser | null } | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<AppUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleExport = () => {
    const exportData = users.map((u) => ({
      ...u,
      isActive: u.isActive ? "Ya" : "Tidak",
      lastLogin: u.lastLogin || "-",
    }));
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
    } catch {
      toast.error("Gagal membaca file Excel");
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

  const filtered = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter(
      (u) =>
        !search ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    ...ALL_ROLES.reduce(
      (acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }),
      {} as Record<UserRole, number>
    ),
  };

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Manajemen User
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        Kelola akun administrator & hak akses
      </p>
    </div>
  );

  return (
    <>
      {hydrated && mobileTitlePortalTarget && createPortal(topbarTitle, mobileTitlePortalTarget)}

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 sm:p-5 rounded-3xl border bg-surface-container-low border-outline-variant/15">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Icon name="groups" filled size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">
                Total Akun
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-display">
              {counts.total}
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

          {ALL_ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            const isActive = roleFilter === r;
            return (
              <div
                key={r}
                className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                  isActive
                    ? "bg-secondary/10 border-secondary/30 ring-1 ring-secondary/20"
                    : "bg-surface-container-low border-outline-variant/15"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-xl ${cfg.activeBg} ${cfg.color}`}>
                    <Icon name={cfg.icon} size="sm" filled />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-primary font-display">
                  {(counts as Record<string, number>)[r] || 0}
                </div>
              </div>
            );
          })}
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
              placeholder="Cari nama, username, atau email..."
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Menu */}
            <ActionMenu
              triggerIcon="filter_list"
              title="Saring Role Pengguna"
              actions={[
                {
                  label: "Semua Role",
                  icon: "list",
                  active: roleFilter === "all",
                  onClick: () => setRoleFilter("all"),
                },
                ...ALL_ROLES.map((r) => ({
                  label: ROLE_CONFIG[r].label,
                  icon: ROLE_CONFIG[r].icon,
                  active: roleFilter === r,
                  onClick: () => setRoleFilter(r),
                })),
              ]}
            />

            {/* Actions Menu */}
            <ActionMenu
              actions={[
                {
                  label: "Tambah User Baru",
                  icon: "person_add",
                  onClick: () => setModal({ mode: "add", user: null }),
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

        {/* User List Cards */}
        <div className="flex flex-col gap-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/15">
              <Icon name="person_off" className="text-5xl text-on-surface-variant/20 mb-3 mx-auto" />
              <p className="text-sm font-semibold text-primary">Tidak ada user ditemukan</p>
              <p className="text-xs text-on-surface-variant/50 mt-1">
                Coba sesuaikan kata kunci pencarian atau role filter.
              </p>
            </div>
          )}

          {filtered.map((u) => {
            const roleCfg = ROLE_CONFIG[u.role];
            return (
              <div
                key={u.id}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-outline-variant/15 bg-surface-container-lowest flex items-center justify-between gap-3 sm:gap-4 hover:border-outline-variant/30 transition-all"
              >
                {/* Avatar Icon */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${roleCfg.activeBg} border ${roleCfg.border} flex items-center justify-center shrink-0 relative font-bold text-sm font-display`}
                  >
                    <Icon name={roleCfg.icon} filled className={`${roleCfg.color} !text-base sm:!text-lg`} />
                    {!u.isActive && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm sm:text-base font-bold text-primary font-display truncate">
                        {u.fullName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleCfg.activeBg} ${roleCfg.border} ${roleCfg.color}`}
                      >
                        {roleCfg.label}
                      </span>
                      {!u.isActive && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant/60 flex-wrap">
                      <span className="font-mono text-secondary font-semibold">@{u.username}</span>
                      <span className="opacity-30">•</span>
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="icon"
                    size="icon"
                    onClick={() => toggleActive(u.id)}
                    className={
                      u.isActive
                        ? "text-emerald-500 hover:bg-emerald-50"
                        : "text-rose-400 hover:bg-rose-50"
                    }
                    title={u.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                  >
                    <Icon name={u.isActive ? "toggle_on" : "toggle_off"} size="sm" />
                  </Button>

                  <Button
                    variant="icon"
                    size="icon"
                    onClick={() => setModal({ mode: "edit", user: u })}
                    title="Edit User"
                  >
                    <Icon name="edit" size="sm" />
                  </Button>

                  {u.role !== "superadmin" && (
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => setDeleteTargetUser(u)}
                      className="hover:bg-rose-50 hover:text-rose-600 text-on-surface-variant/40"
                      title="Hapus Akun"
                    >
                      <Icon name="delete" size="sm" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetUser)}
        onClose={() => setDeleteTargetUser(null)}
        onConfirm={async () => {
          if (deleteTargetUser) {
            await removeUser(deleteTargetUser.id);
            toast.success(`Akun "${deleteTargetUser.fullName}" berhasil dihapus.`);
            setDeleteTargetUser(null);
          }
        }}
        title="Hapus Akun Administrator"
        message={`Apakah Anda yakin ingin menghapus akun administrator "${deleteTargetUser?.fullName}" (@${deleteTargetUser?.username})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Akun"
        variant="danger"
      />
    </>
  );
}
