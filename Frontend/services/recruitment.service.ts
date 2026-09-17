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
  cv_url: a.cv_url || null,
  portfolio_url: a.portfolio_url || null,
  period: a.period || "2026/2027",
  status: a.status as RecruitmentStatus,
  adminNote: a.admin_note || "",
  appliedAt: a.applied_at ? new Date(a.applied_at).toISOString().split("T")[0] : "",
  interviewResult: a.interview_result
    ? {
        id: a.interview_result.id,
        candidate_name: a.interview_result.candidate_name,
        interviewer_name: a.interview_result.interviewer_name || null,
        interview_date: a.interview_result.interview_date
          ? new Date(a.interview_result.interview_date).toISOString().split("T")[0]
          : "",
        answers: Array.isArray(a.interview_result.answers)
          ? a.interview_result.answers
          : [],
        notes: a.interview_result.notes || null,
        year_period: a.interview_result.year_period || 2026,
      }
    : null,
});

export const recruitmentService = {
  /** Fetch applicants — returns frontend-ready Applicant[] + meta */
  fetchApplicants: async (params?: { search?: string; status?: string; period?: string; page?: number }) => {
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
    cv_url?: string;
    portfolio_url?: string;
    period?: string;
  }) => api.post("/recruitment/apply", data),

  /** Update applicant status */
  updateStatus: (id: string, status: string, admin_note?: string) =>
    api.patch(`/recruitment/applicants/${id}/status`, { status, admin_note }),

  /** Delete applicant */
  deleteApplicant: (id: string) =>
    api.delete(`/recruitment/applicants/${id}`),

  /* Raw calls */
  getApplicants: (params?: { search?: string; status?: string; period?: string; page?: number }) =>
    api.get("/recruitment/applicants", { params }),

  getAnnouncement: async () => {
    const res = await api.get("/recruitment/announcement");
    return res.data;
  },

  toggleAnnouncement: async (isOpen: boolean, period?: string) => {
    const res = await api.patch("/recruitment/announcement/toggle", { isOpen, period });
    return res.data;
  },

  /* ── Periode Penerimaan API ── */
  getPeriods: async () => {
    const res = await api.get("/recruitment/periods");
    return res.data;
  },

  createPeriod: async (data: { period: string; title?: string; is_active?: boolean }) => {
    const res = await api.post("/recruitment/periods", data);
    return res.data;
  },

  setActivePeriod: async (period: string) => {
    const res = await api.patch("/recruitment/periods/active", { period });
    return res.data;
  },

  deletePeriod: async (period: string) => {
    const res = await api.delete(`/recruitment/periods/${encodeURIComponent(period)}`);
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
