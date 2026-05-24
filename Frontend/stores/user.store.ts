import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserRole, AppUser } from "@/components/feature/users/types/user.type";
export type * from "@/components/feature/users/types/user.type";

import { userService } from "@/services/user.service";

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; border: string; activeBg: string; activeBorder: string; activeShadow: string; icon: string }> = {
  superadmin: { 
    label: "Super Admin", color: "text-purple-600", 
    bg: "bg-purple-50/50", border: "border-purple-200/50", 
    activeBg: "bg-purple-50", activeBorder: "border-purple-400/60", activeShadow: "shadow-purple-500/10",
    icon: "shield" 
  },
  admin: { 
    label: "Admin", color: "text-blue-600", 
    bg: "bg-blue-50/50", border: "border-blue-200/50", 
    activeBg: "bg-blue-50", activeBorder: "border-blue-400/60", activeShadow: "shadow-blue-500/10",
    icon: "admin_panel_settings" 
  },
};

interface UserState {
  users: AppUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (data: Omit<AppUser, "id" | "createdAt" | "lastLogin">) => Promise<void>;
  updateUser: (id: string, data: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
  toggleActive: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      isLoading: false,
      error: null,

      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const users = await userService.fetchUsers();
          set({ users, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal memuat data user.", isLoading: false });
        }
      },

      addUser: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await userService.register({
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            role: data.role,
          });
          // Refresh list after adding
          await get().fetchUsers();
        } catch (err: any) {
          const msg = err.response?.data?.message || "Gagal menambahkan user.";
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      updateUser: (id, data) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),

      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      toggleActive: (id) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, isActive: !u.isActive } : u
          ),
        })),
    }),
    { name: "mdptv-users" }
  )
);
