import { create } from "zustand";
import { persist } from "zustand/middleware";
import { memberService, type CreateMemberDto } from "@/services/member.service";

export interface AppMember {
  id: string;
  name: string;
  npm?: string;
  phone?: string;
  email?: string;
  division_id?: string;
  division: string;
  angkatan: number;
  tahun_masuk?: number;
  is_core?: boolean;
  is_active: boolean;
}

interface MemberState {
  members: AppMember[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  addMember: (data: CreateMemberDto) => Promise<void>;
  updateMember: (id: string, data: Partial<CreateMemberDto>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: [],
      isLoading: false,
      error: null,

      fetchMembers: async () => {
        set({ isLoading: true, error: null });
        try {
          const members = await memberService.getAll();
          // Type casting since the generic fetch returned 'Member' compatible shape
          set({ members: members as AppMember[], isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal memuat data anggota", isLoading: false });
        }
      },

      addMember: async (data: CreateMemberDto) => {
        set({ isLoading: true, error: null });
        try {
          await memberService.create(data);
          await get().fetchMembers();
        } catch (err: any) {
          const msg = err.response?.data?.message || "Gagal menambahkan anggota";
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      updateMember: async (id: string, data: Partial<CreateMemberDto>) => {
        set({ isLoading: true, error: null });
        try {
            await memberService.update(id, data);
            await get().fetchMembers();
        } catch (err: any) {
          const msg = err.response?.data?.message || "Gagal mengupdate anggota";
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      removeMember: async (id: string) => {
        try {
          await memberService.delete(id);
          await get().fetchMembers();
        } catch (err: any) {
          throw new Error(err.response?.data?.message || "Gagal menghapus anggota");
        }
      },

      toggleActive: async (id: string) => {
        try {
          await memberService.toggleActive(id);
          await get().fetchMembers();
        } catch (err: any) {
             throw new Error(err.response?.data?.message || "Gagal mengubah status anggota");
        }
      },
    }),
    { name: "mdptv-members" }
  )
);
