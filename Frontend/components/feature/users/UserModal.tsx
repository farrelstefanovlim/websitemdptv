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
    role: user?.role || "admin" as UserRole,
    password: user?.password || "",
    isActive: user?.isActive ?? true,
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!form.username.trim() || form.password.length < 6 || !form.email.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-container-lowest z-10 p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">{user ? "Edit User" : "Tambah User Baru"}</h3>
          <Button variant="icon" size="icon" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>
        <div className="p-5 grid gap-3">
          {error && <Alert variant="error">{error}</Alert>}
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
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              options={ALL_ROLES.map((r) => ({ label: ROLE_CONFIG[r].label, value: r }))}
            />
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Status</label>
              <Button type="button" size="none" onClick={() => set("isActive", !form.isActive)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${form.isActive ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100" : "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"}`}>
                {form.isActive ? "✓ Aktif" : "✕ Nonaktif"}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">Password *</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)}
                className={`${inputCls} pr-10`} placeholder="Minimal 6 karakter" />
              <Button type="button" variant="icon" size="icon" onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2">
                <Icon name={showPw ? "visibility_off" : "visibility"} size="sm" />
              </Button>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-surface-container-lowest p-5 border-t border-outline-variant/10 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}
            disabled={isSubmitting || !form.username.trim() || form.password.length < 6 || !form.email.trim()}>
            {isSubmitting ? "Menyimpan..." : (user ? "Simpan" : "Tambah User")}
          </Button>
        </div>
      </div>
    </div>
  );
}
