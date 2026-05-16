"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
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

/* ── Add/Edit Modal ───────────────────────────────── */

function UserModal({ user, onClose, onSave }: {
  user: AppUser | null;
  onClose: () => void;
  onSave: (data: Partial<AppUser>) => void;
}) {
  const [form, setForm] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "admin" as UserRole,
    password: user?.password || "",
    isActive: user?.isActive ?? true,
  });
  const [showPw, setShowPw] = useState(false);

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{user ? "Edit User" : "Tambah User Baru"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-all">
            <Icon name="close" size="sm" />
          </button>
        </div>
        <div className="p-5 grid gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Username *</label>
            <input type="text" value={form.username} onChange={(e) => set("username", e.target.value)} className={inputCls} placeholder="username" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Nama Lengkap *</label>
            <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} placeholder="Nama lengkap" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="user@mdptv.ac.id" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}>
                {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Status</label>
              <button type="button" onClick={() => set("isActive", !form.isActive)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${form.isActive ? "border-green-300 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-600"}`}>
                {form.isActive ? "✓ Aktif" : "✕ Nonaktif"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Password *</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)}
                className={`${inputCls} pr-10`} placeholder="Minimal 6 karakter" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:text-primary transition-colors">
                <Icon name={showPw ? "visibility_off" : "visibility"} size="sm" />
              </button>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-outline-variant/25 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all">
            Batal
          </button>
          <button onClick={() => { if (form.username.trim() && form.password.length >= 6) onSave(form); }}
            className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40"
            disabled={!form.username.trim() || form.password.length < 6 || !form.email.trim()}>
            {user ? "Simpan" : "Tambah User"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
            <button onClick={handleExport}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
              title="Export ke Excel">
              <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={() => importRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              title="Import dari Excel">
              <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
            </button>
            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            <button onClick={() => setModal({ mode: "add", user: null })}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl bg-secondary text-on-secondary hover:brightness-110 transition-all duration-300">
              <Icon name="person_add" size="sm" /> <span className="hidden sm:inline">Tambah</span>
            </button>
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
              <button key={r} onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${roleFilter === r ? "border-secondary/30 bg-secondary/5 shadow-sm" : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30"}`}>
                <Icon name={cfg.icon} filled className={`${cfg.color} !text-lg mb-1`} />
                <div className="text-xl sm:text-2xl font-black text-primary">{(counts as Record<string, number>)[r] || 0}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">{cfg.label}</div>
              </button>
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
            <button onClick={() => setRoleFilter("all")} className="text-[10px] text-secondary font-bold hover:underline ml-1">Clear</button>
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
                  <button onClick={() => toggleActive(u.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${u.isActive ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50"}`}
                    title={u.isActive ? "Nonaktifkan" : "Aktifkan"}>
                    <Icon name={u.isActive ? "toggle_on" : "toggle_off"} size="sm" />
                  </button>
                  <button onClick={() => setModal({ mode: "edit", user: u })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:bg-secondary/10 hover:text-secondary transition-all"
                    title="Edit">
                    <Icon name="edit" size="sm" />
                  </button>
                  {u.role !== "superadmin" && (
                    <button onClick={() => { if (confirm(`Hapus user "${u.fullName}"?`)) removeUser(u.id); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:bg-error/10 hover:text-error transition-all"
                      title="Hapus">
                      <Icon name="delete" size="sm" />
                    </button>
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
