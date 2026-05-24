import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";

interface AuthUser {
  id: string;
  username: string;
  role: "superadmin" | "admin";
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(email, password);
          const { accessToken, user } = res.data.data;
          set({
            accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.message || "Login gagal. Coba lagi.";
          set({ isLoading: false, error: message });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // ignore logout errors
        } finally {
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const res = await authService.refresh();
          const newToken = res.data.data.accessToken;
          set({ accessToken: newToken });
          return true;
        } catch {
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "mdptv-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
