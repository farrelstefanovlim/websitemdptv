import api from "@/lib/axios";
import type { Member } from "@/components/feature/absensi/types/attendance.type";

export interface CreateMemberDto {
  full_name: string;
  division_id: string;
  angkatan: number;
  is_active?: boolean;
}

export const memberService = {
  getAll: async (): Promise<Member[]> => {
    const res = await api.get("/members");
    return (res.data.data || []).map((u: any) => ({
      id: u.id,
      name: u.full_name,
      division_id: u.division_id,
      division: u.division?.name || "",
      angkatan: u.angkatan,
      is_active: u.is_active,
    }));
  },

  create: (data: CreateMemberDto) => api.post("/members", data),
  update: (id: string, data: Partial<CreateMemberDto>) => api.patch(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
  toggleActive: (id: string) => api.patch(`/members/${id}/feature`),
};
