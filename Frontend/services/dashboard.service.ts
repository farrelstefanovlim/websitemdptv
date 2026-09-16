import api from "@/lib/axios";

export interface DashboardMetrics {
  registrationOpen?: boolean;
  users: Array<{ role: string; count: number }>;
  members: {
    total: number;
    byDivision: Array<{ name: string; count: number }>;
  };
  applicants: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
    recent?: Array<{
      id: string;
      name: string;
      nim: string;
      division: string;
      status: string;
      applied_at: string;
    }>;
  };
  kegiatan: {
    total: number;
    upcoming?: Array<{
      id: string;
      title: string;
      date: string;
      location: string;
      status: string;
      division: string;
    }>;
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
