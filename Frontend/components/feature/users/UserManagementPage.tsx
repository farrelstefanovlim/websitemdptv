"use client";
import { useState, useRef } from "react";
import UserModal from "@/components/feature/users/UserModal";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useUserStore, type AppUser, type UserRole, ROLE_CONFIG } from "@/stores/user.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel } from "@/lib/excel";

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
  const { users, addUser, updateUser, removeUser, toggleActive } = useUserStore();
  const hydrated = useHydrated();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; user: AppUser | null } | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

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
      alert(`Berhasil import ${imported} user (password default: default123)`);
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

  const filtered = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter((u) => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    ...ALL_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {} as Record<UserRole, number>),
  };

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">Manajemen User</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Kelola akun pengguna & hak akses</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button size="sm" variant="success" onClick={handleExport} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs" title="Export ke Excel">
              <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => importRef.current?.click()} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs" title="Import dari Excel">
              <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
            </Button>
            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            <Button size="sm" variant="primary" onClick={() => setModal({ mode: "add", user: null })} className="px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs">
              <Icon name="person_add" size="sm" /> <span className="hidden sm:inline">Tambah</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <div className="p-3 sm:p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
            <Icon name="groups" filled className="text-secondary !text-lg mb-1" />
            <div className="text-xl sm:text-2xl font-black text-primary">{counts.total}</div>
            <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">Total User</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
            <Icon name="check_circle" filled className="text-green-500 !text-lg mb-1" />
            <div className="text-xl sm:text-2xl font-black text-primary">{counts.active}</div>
            <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">Aktif</div>
          </div>
          {ALL_ROLES.map((r) => {
            const cfg = ROLE_CONFIG[r];
            return (
              <Button key={r} size="none" variant="ghost" onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all justify-start items-start flex-col ${roleFilter === r ? "border-secondary/30 bg-secondary/5 shadow-sm" : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30"}`}>
                <Icon name={cfg.icon} filled className={`${cfg.color} !text-lg mb-1`} />
                <div className="text-xl sm:text-2xl font-black text-primary">{(counts as Record<string, number>)[r] || 0}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">{cfg.label}</div>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
              placeholder="Cari nama atau username..." />
          </div>
        </div>

        {/* Filter indicator */}
        {roleFilter !== "all" && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-on-surface-variant/50">Filter:</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ROLE_CONFIG[roleFilter].bg} ${ROLE_CONFIG[roleFilter].color}`}>
              {ROLE_CONFIG[roleFilter].label}
            </span>
            <Button size="none" variant="ghost" onClick={() => setRoleFilter("all")} className="text-[10px] text-secondary font-bold hover:underline ml-1">Clear</Button>
          </div>
        )}

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
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${roleCfg.bg} flex items-center justify-center shrink-0 relative`}>
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
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${roleCfg.bg} ${roleCfg.color}`}>
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
          onSave={(data) => {
            if (modal.mode === "edit" && modal.user) {
              updateUser(modal.user.id, data);
            } else {
              addUser(data as Omit<AppUser, "id" | "createdAt" | "lastLogin">);
            }
            setModal(null);
          }}
        />
      )}
    </>
  );
}
