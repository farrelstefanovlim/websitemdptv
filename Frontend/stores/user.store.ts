import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserRole, AppUser } from "@/components/feature/users/types/user.type";
export type * from "@/components/feature/users/types/user.type";

const DEFAULT_USERS: AppUser[] = [
  {
    id: "u1",
    username: "superadmin",
    fullName: "Super Administrator",
    email: "admin@mdptv.ac.id",
    role: "superadmin",
    password: "admin123",
    isActive: true,
    createdAt: "2026-01-01",
    lastLogin: "2026-05-16",
  },
  {
    id: "u2",
    username: "ahmad",
    fullName: "Ahmad Rizky",
    email: "ahmad@mdptv.ac.id",
    role: "admin",
    password: "admin789",
    isActive: true,
    createdAt: "2026-03-15",
    lastLogin: "2026-05-14",
  },
  {
    id: "u3",
    username: "admin1",
    fullName: "Siti Nurhaliza",
    email: "siti@mdptv.ac.id",
    role: "admin",
    password: "admin456",
    isActive: true,
    createdAt: "2026-04-01",
    lastLogin: "2026-05-10",
  },
  {
    id: "u4",
    username: "budi",
    fullName: "Budi Santoso",
    email: "budi@mdptv.ac.id",
    role: "admin",
    password: "admin012",
    isActive: false,
    createdAt: "2026-04-20",
    lastLogin: null,
  },
];

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; icon: string }> = {
  superadmin: { label: "Super Admin", color: "text-purple-600", bg: "bg-purple-50", icon: "shield" },
  admin: { label: "Admin", color: "text-blue-600", bg: "bg-blue-50", icon: "admin_panel_settings" },
};

interface UserState {
  users: AppUser[];
  addUser: (data: Omit<AppUser, "id" | "createdAt" | "lastLogin">) => void;
  updateUser: (id: string, data: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
  toggleActive: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: DEFAULT_USERS,

      addUser: (data) =>
        set((state) => ({
          users: [
            {
              ...data,
              id: `u-${Date.now()}`,
              createdAt: new Date().toISOString().split("T")[0],
              lastLogin: null,
            },
            ...state.users,
          ],
        })),

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
