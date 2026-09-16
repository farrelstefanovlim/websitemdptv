import api from "@/lib/axios";
import type { Applicant, RecruitmentStatus } from "@/components/feature/recruitment/types/recruitment.type";

/* ── Mapper ── */
const mapApplicant = (a: any): Applicant => ({
  id: a.id,
  name: a.name,
  npm: a.npm,
  email: a.email,
  phone: a.phone || "",
  division: a.division?.name || "",
  motivation: a.motivation,
  status: a.status as RecruitmentStatus,
  adminNote: a.admin_note || "",
  appliedAt: a.applied_at ? new Date(a.applied_at).toISOString().split("T")[0] : "",
});

export const recruitmentService = {
  /** Fetch applicants — returns frontend-ready Applicant[] + meta */
  fetchApplicants: async (params?: { search?: string; status?: string; page?: number }) => {
    const res = await api.get("/recruitment/applicants", { params });
    const applicants = (res.data.data || []).map(mapApplicant);
    const meta = res.data.meta || null;
    return { applicants, meta };
  },

  /** Submit a new application */
  apply: (data: {
    name: string;
    npm: string;
    email: string;
    phone?: string;
    division_id: string;
    motivation: string;
  }) => api.post("/recruitment/apply", data),

  /** Update applicant status */
  updateStatus: (id: string, status: string, admin_note?: string) =>
    api.patch(`/recruitment/applicants/${id}/status`, { status, admin_note }),

  /* Raw calls */
  getApplicants: (params?: { search?: string; status?: string; page?: number }) =>
    api.get("/recruitment/applicants", { params }),

  getAnnouncement: async () => {
    const res = await api.get("/recruitment/announcement");
    return res.data;
  },

  toggleAnnouncement: async (isOpen: boolean) => {
    const res = await api.patch("/recruitment/announcement/toggle", { isOpen });
    return res.data;
  },

  // ==========================================
  // FITUR BARU: WHATSAPP GROUP LINK
  // ==========================================
  getWhatsAppLink: async () => {
    const res = await api.get("/recruitment/whatsapp-link");
    return res.data;
  },

  updateWhatsAppLink: async (link: string) => {
    const res = await api.put("/recruitment/whatsapp-link", { link });
    return res.data;
  },
};
