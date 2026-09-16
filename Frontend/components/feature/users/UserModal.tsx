"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Modal from "@/components/ui/Modal";
import Alert from "@/components/ui/Alert";
import { type AppUser, type UserRole, ROLE_CONFIG } from "@/stores/user.store";

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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="lg"
      title={user ? "Edit Akun Administrator" : "Tambah User Admin Baru"}
      description="Pengaturan kredensial login dan hak akses sistem manajemen MDPTV"
      headerIcon="admin_panel_settings"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSubmitting}
            disabled={!form.username.trim() || !form.fullName.trim() || !form.email.trim()}
          >
            {user ? "Simpan Perubahan" : "Tambah User"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Username */}
        <Input
          label="Username"
          required
          startIcon="alternate_email"
          value={form.username}
          onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
          placeholder="contoh: admin_kegiatan"
        />

        {/* Nama Lengkap */}
        <Input
          label="Nama Lengkap"
          required
          startIcon="badge"
          value={form.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Nama lengkap administrator"
        />

        {/* Email */}
        <Input
          label="Email Resmi"
          required
          type="email"
          startIcon="mail"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="admin@mdptv.com"
        />

        {/* Role Selection */}
        <Select
          label="Tingkat Akses (Role)"
          startIcon="security"
          value={form.role}
          onChange={(e) => set("role", e.target.value as UserRole)}
          options={ALL_ROLES.map((r) => ({
            label: ROLE_CONFIG[r].label,
            value: r,
          }))}
        />

        {/* Password Input with built-in toggle */}
        <Input
          label={user ? "Password Baru (Kosongkan jika tidak ingin diubah)" : "Kata Sandi"}
          required={!user}
          isPassword
          startIcon="lock"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="Minimal 6 karakter"
          helperText="Gunakan kombinasi karakter yang aman"
        />

        {/* Status Akun */}
        <div className="p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40">
          <Switch
            checked={form.isActive}
            onChange={(checked) => set("isActive", checked)}
            label="Status Akun Pengguna"
            description={
              form.isActive
                ? "Akun aktif dan diizinkan login ke dalam panel admin"
                : "Akun dinonaktifkan dan diblokir dari akses login"
            }
          />
        </div>
      </div>
    </Modal>
  );
}
