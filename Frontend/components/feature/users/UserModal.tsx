"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { type AppUser, type UserRole, ROLE_CONFIG } from "@/stores/user.store";
import Alert from "@/components/ui/Alert";

const ALL_ROLES: UserRole[] = ["superadmin", "admin"];

interface UserModalProps {
  user: AppUser | null;
  onClose: () => void;
  onSave: (data: Partial<AppUser>) => Promise<void> | void;
}

export default function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: (user?.role || "admin") as UserRole,
    password: user?.password || "",
    isActive: user?.isActive ?? true,
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!form.username.trim()) {
      setError("Username wajib diisi!");
      return;
    }
    if (!form.fullName.trim()) {
      setError("Nama lengkap wajib diisi!");
      return;
    }
    if (!form.email.trim()) {
      setError("Email wajib diisi!");
      return;
    }
    if (!user && form.password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan data user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/30";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant/15">
        <div className="sticky top-0 bg-surface-container-lowest z-10 px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-primary font-display">
              {user ? "Edit Akun Administrator" : "Tambah User Admin Baru"}
            </h3>
            <p className="text-[10px] text-on-surface-variant/50">
              Pengaturan kredensial login dan hak akses sistem
            </p>
          </div>
          <Button variant="icon" size="icon" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        <div className="p-6 grid gap-4">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Username */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Username *
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
              className={inputCls}
              placeholder="contoh: admin_kegiatan"
            />
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className={inputCls}
              placeholder="Nama lengkap administrator"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              Email Resmi *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
              placeholder="admin@mdptv.com"
            />
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tingkat Akses (Role)"
              value={form.role}
              onChange={(e) => set("role", e.target.value as UserRole)}
              options={ALL_ROLES.map((r) => ({
                label: ROLE_CONFIG[r].label,
                value: r,
              }))}
            />

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
                Status Akun
              </label>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  form.isActive
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                }`}
              >
                {form.isActive ? "✓ Akun Aktif" : "✕ Nonaktif"}
              </button>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
              {user ? "Password Baru (Kosongkan jika tidak ingin diubah)" : "Kata Sandi *"}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={`${inputCls} pr-10`}
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary"
              >
                <Icon name={showPw ? "visibility_off" : "visibility"} size="sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-2.5 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || !form.username.trim() || !form.fullName.trim() || !form.email.trim()}
          >
            {isSubmitting ? "Menyimpan..." : user ? "Simpan Perubahan" : "Tambah User"}
          </Button>
        </div>
      </div>
    </div>
  );
}
