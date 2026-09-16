import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Applicant,
  RecruitmentStatus,
} from "@/components/feature/recruitment/types/recruitment.type";

import { recruitmentService } from "@/services/recruitment.service";

interface RecruitmentState {
  registrationOpen: boolean;
  announcementOpen: boolean;
  announcementPeriod: string;
  selectedPeriod: string;
  availablePeriods: string[];
  groupLink: string;
  applicants: Applicant[];
  isLoading: boolean;
  error: string | null;
  meta: { page: number; limit: number; total: number; totalPages: number } | null;
  toggleRegistration: () => void;
  setGroupLink: (link: string) => void;
  fetchGroupLink: () => Promise<void>;
  saveGroupLinkToDb: (link: string) => Promise<boolean>;
  setSelectedPeriod: (period: string) => void;
  fetchPeriods: () => Promise<void>;
  createPeriod: (period: string, title?: string, is_active?: boolean) => Promise<boolean>;
  setActivePeriod: (period: string) => Promise<boolean>;
  deletePeriod: (period: string) => Promise<boolean>;
  fetchApplicants: (params?: { search?: string; status?: string; period?: string; page?: number }) => Promise<void>;
  addApplicant: (data: Omit<Applicant, "id" | "status" | "adminNote" | "appliedAt">) => Promise<boolean>;
  updateStatus: (id: string, status: RecruitmentStatus) => Promise<void>;
  updateNote: (id: string, note: string) => Promise<void>;
  removeApplicant: (id: string) => Promise<boolean>;
  fetchAnnouncementState: () => Promise<void>;
  toggleAnnouncement: (period?: string) => Promise<void>;
  hasRegistered: boolean;
  setHasRegistered: (val: boolean) => void;
}

export const useRecruitmentStore = create<RecruitmentState>()(
  persist(
    (set, get) => ({
      registrationOpen: true,
      announcementOpen: false,
      announcementPeriod: "2026/2027",
      selectedPeriod: "2026/2027",
      availablePeriods: ["2026/2027", "2025/2026"],
      groupLink: "",
      applicants: [],
      isLoading: false,
      error: null,
      meta: null,
      hasRegistered: false,
      setHasRegistered: (val) => set({ hasRegistered: val }),

      toggleRegistration: () =>
        set((state) => ({ registrationOpen: !state.registrationOpen })),

      setGroupLink: (link: string) => set({ groupLink: link }),

      setSelectedPeriod: (period: string) => {
        set({ selectedPeriod: period });
        get().fetchApplicants({ period });
      },

      fetchPeriods: async () => {
        try {
          const res = await recruitmentService.getPeriods();
          if (res.status === "success" && res.data) {
            set({
              availablePeriods: res.data.periods || ["2026/2027"],
              announcementPeriod: res.data.announcementPeriod || "2026/2027",
            });
          }
        } catch (err) {
          console.error("Gagal memuat periode penerimaan:", err);
        }
      },

      createPeriod: async (period: string, title?: string, is_active?: boolean) => {
        try {
          await recruitmentService.createPeriod({ period, title, is_active });
          await get().fetchPeriods();
          set({ selectedPeriod: period });
          await get().fetchApplicants({ period });
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal membuat periode baru." });
          return false;
        }
      },

      setActivePeriod: async (period: string) => {
        try {
          await recruitmentService.setActivePeriod(period);
          await get().fetchPeriods();
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal mengubah periode aktif." });
          return false;
        }
      },

      deletePeriod: async (period: string) => {
        try {
          await recruitmentService.deletePeriod(period);
          await get().fetchPeriods();
          const remaining = get().availablePeriods;
          const next = remaining[0] || "2026/2027";
          set({ selectedPeriod: next });
          await get().fetchApplicants({ period: next });
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal menghapus periode." });
          return false;
        }
      },

      // ==========================================
      // FITUR BARU: Ambil & Simpan Link WA
      // ==========================================
      fetchGroupLink: async () => {
        try {
          const { data } = await recruitmentService.getWhatsAppLink();
          set({ groupLink: data });
        } catch (err) {
          console.error("Gagal memuat link WhatsApp", err);
        }
      },

      saveGroupLinkToDb: async (link: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await recruitmentService.updateWhatsAppLink(link);
          set({ groupLink: data, isLoading: false });
          return true;
        } catch (err: any) {
          console.error("Gagal menyimpan link WhatsApp", err);
          set({ error: err.response?.data?.message || "Gagal menyimpan link WhatsApp", isLoading: false });
          return false;
        }
      },
      // ==========================================

      fetchApplicants: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const currentPeriod = params?.period ?? get().selectedPeriod;
          const { applicants, meta } = await recruitmentService.fetchApplicants({
            ...params,
            period: currentPeriod,
          });
          set({ applicants, meta, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal memuat data pendaftar.", isLoading: false });
        }
      },

      addApplicant: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await recruitmentService.apply({
            name: data.name,
            npm: data.npm,
            email: data.email,
            phone: data.phone || undefined,
            division_id: data.division,
            motivation: data.motivation,
            cv_url: data.cv_url || undefined,
            portfolio_url: data.portfolio_url || undefined,
            period: data.period || get().selectedPeriod,
          });
          set({ isLoading: false, hasRegistered: true });
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal mendaftar.", isLoading: false });
          return false;
        }
      },

      updateStatus: async (id, status) => {
        try {
          await recruitmentService.updateStatus(id, status);
          set((state) => ({
            applicants: state.applicants.map((a) =>
              a.id === id ? { ...a, status } : a
            ),
          }));
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal mengubah status." });
        }
      },

      updateNote: async (id, note) => {
        try {
          await recruitmentService.updateStatus(id, get().applicants.find((a) => a.id === id)?.status || "pending", note);
          set((state) => ({
            applicants: state.applicants.map((a) =>
              a.id === id ? { ...a, adminNote: note } : a
            ),
          }));
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal mengubah catatan." });
        }
      },

      removeApplicant: async (id: string) => {
        try {
          await recruitmentService.deleteApplicant(id);
          set((state) => ({
            applicants: state.applicants.filter((a) => a.id !== id),
          }));
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal menghapus pendaftar." });
          return false;
        }
      },

      fetchAnnouncementState: async () => {
        try {
          const { data } = await recruitmentService.getAnnouncement();
          set({
            announcementOpen: data.isOpen,
            announcementPeriod: data.period || "2026/2027",
          });
        } catch(err) {
          console.error("Gagal memuat state pengumuman", err);
        }
      },

      toggleAnnouncement: async (period?: string) => {
        try {
          const currentState = get().announcementOpen;
          const targetPeriod = period || get().selectedPeriod;
          const { data } = await recruitmentService.toggleAnnouncement(!currentState, targetPeriod);
          set({
            announcementOpen: data.isOpen,
            announcementPeriod: data.period,
          });
        } catch(err: any) {
          console.error("Gagal update state pengumuman", err);
          set({ error: "Gagal mengubah state pengumuman" });
        }
      },
    }),
    { name: "mdptv-recruitment" }
  )
);
