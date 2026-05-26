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
  groupLink: string;
  applicants: Applicant[];
  isLoading: boolean;
  error: string | null;
  meta: { page: number; limit: number; total: number; totalPages: number } | null;
  toggleRegistration: () => void;
  setGroupLink: (link: string) => void;
  fetchApplicants: (params?: { search?: string; status?: string; page?: number }) => Promise<void>;
  addApplicant: (data: Omit<Applicant, "id" | "status" | "adminNote" | "appliedAt">) => Promise<boolean>;
  updateStatus: (id: string, status: RecruitmentStatus) => Promise<void>;
  updateNote: (id: string, note: string) => Promise<void>;
  fetchAnnouncementState: () => Promise<void>;
  toggleAnnouncement: () => Promise<void>;
}

export const useRecruitmentStore = create<RecruitmentState>()(
  persist(
    (set, get) => ({
      registrationOpen: true,
      announcementOpen: false,
      groupLink: "",
      applicants: [],
      isLoading: false,
      error: null,
      meta: null,

      toggleRegistration: () =>
        set((state) => ({ registrationOpen: !state.registrationOpen })),

      setGroupLink: (link: string) => set({ groupLink: link }),

      fetchApplicants: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const { applicants, meta } = await recruitmentService.fetchApplicants(params);
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
            nim: data.nim,
            email: data.email,
            phone: data.phone || undefined,
            division_id: data.division,
            motivation: data.motivation,
          });
          set({ isLoading: false });
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

      fetchAnnouncementState: async () => {
        try {
          const { data } = await recruitmentService.getAnnouncement();
          set({ announcementOpen: data.isOpen });
        } catch(err) {
          console.error("Gagal memuat state pengumuman", err);
        }
      },

      toggleAnnouncement: async () => {
        try {
          const currentState = get().announcementOpen;
          const { data } = await recruitmentService.toggleAnnouncement(!currentState);
          set({ announcementOpen: data.isOpen });
        } catch(err: any) {
          console.error("Gagal update state pengumuman", err);
          set({ error: "Gagal mengubah state pengumuman" });
        }
      },
    }),
    { name: "mdptv-recruitment" }
  )
);
