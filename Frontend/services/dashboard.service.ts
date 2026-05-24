import api from "@/lib/axios";

export interface DashboardMetrics {
  users: Array<{ role: string; count: number }>;
  members: {
    total: number;
    byDivision: Array<{ name: string; count: number }>;
  };
  applicants: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  kegiatan: {
    total: number;
  };
  attendance: {
    todayTotal: number;
    byStatus: Array<{ status: string; count: number }>;
  };
}

export const dashboardService = {
  fetchMetrics: async (): Promise<DashboardMetrics> => {
    const res = await api.get("/dashboard/metrics");
    return res.data;
  },
};
