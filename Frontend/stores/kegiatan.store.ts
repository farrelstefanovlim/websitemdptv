import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  KegiatanStatus,
  ProposalFile,
  Kegiatan,
} from "@/components/feature/kegiatan/types/kegiatan.type";

export type * from "@/components/feature/kegiatan/types/kegiatan.type";

import { kegiatanService } from "@/services/kegiatan.service";

interface KegiatanState {
  items: Kegiatan[];
  isLoading: boolean;
  error: string | null;
  fetchKegiatan: (params?: { division_id?: string; status?: string }) => Promise<void>;
  addKegiatan: (k: Omit<Kegiatan, "id" | "createdAt">) => Promise<void>;
  updateKegiatan: (id: string, data: Partial<Kegiatan>) => void;
  removeKegiatan: (id: string) => void;
  setProposal: (id: string, file: ProposalFile | null) => void;
  updateStatus: (id: string, status: KegiatanStatus, notes?: string) => Promise<void>;
}

export const useKegiatanStore = create<KegiatanState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchKegiatan: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const items = await kegiatanService.fetchKegiatan(params);
          set({ items, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal memuat data kegiatan.", isLoading: false });
        }
      },

      addKegiatan: async (k) => {
        set({ isLoading: true, error: null });
        try {
          await kegiatanService.create({
            title: k.title,
            description: k.description,
            event_date: k.date,
            location: k.location,
            budget: k.budget,
          });
          await get().fetchKegiatan();
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal menambahkan kegiatan.", isLoading: false });
        }
      },

      updateKegiatan: (id, data) =>
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),

      removeKegiatan: (id) =>
        set((s) => ({ items: s.items.filter((item) => item.id !== id) })),

      setProposal: (id, file) =>
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, proposal: file } : item)),
        })),

      updateStatus: async (id, status, notes) => {
        try {
          await kegiatanService.updateStatus(id, status, notes);
          set((s) => ({
            items: s.items.map((item) =>
              item.id === id ? { ...item, status, notes: notes || item.notes } : item
            ),
          }));
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal mengubah status kegiatan." });
        }
      },
    }),
    { name: "mdptv-kegiatan" }
  )
);
