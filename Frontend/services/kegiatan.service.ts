import api from "@/lib/axios";
import type { Kegiatan, KegiatanStatus } from "@/components/feature/kegiatan/types/kegiatan.type";

/* ── Mapper ── */
const mapKegiatan = (k: any): Kegiatan => ({
  id: k.id,
  title: k.title,
  description: k.description || "",
  division: k.division?.name || "All Division",
  date: k.event_date ? new Date(k.event_date).toISOString().split("T")[0] : "",
  location: k.location || "",
  status: k.status as KegiatanStatus,
  pic: k.pic_user?.full_name || k.pic || "",
  budget: k.budget || "",
  proposal: k.proposal_file
    ? {
        name: k.proposal_file.file_name,
        type: k.proposal_file.file_type,
        size: k.proposal_file.file_size,
        url: k.proposal_file.file_url,
      }
    : null,
  notes: k.notes || "",
  createdAt: k.created_at ? new Date(k.created_at).toISOString().split("T")[0] : "",
});

export const kegiatanService = {
  /** Fetch all kegiatan — returns frontend-ready Kegiatan[] */
  fetchKegiatan: async (params?: { division_id?: string; status?: string }): Promise<Kegiatan[]> => {
    const res = await api.get("/kegiatan", { params });
    return (res.data.data || []).map(mapKegiatan);
  },

  /** Create a new kegiatan */
  create: (data: {
    title: string;
    description?: string;
    division_id?: string;
    event_date: string;
    location?: string;
    budget?: string;
  }) => api.post("/kegiatan", data),

  /** Update kegiatan status */
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/kegiatan/${id}/status`, { status, notes }),

  /** Upload proposal file */
  uploadProposal: (
    id: string,
    fileData: {
      file_name: string;
      file_type: string;
      file_size: number;
      file_url: string;
    }
  ) => api.post(`/kegiatan/${id}/upload-proposal`, fileData),

  /* Raw calls */
  getAll: (params?: { division_id?: string; status?: string }) =>
    api.get("/kegiatan", { params }),
};
