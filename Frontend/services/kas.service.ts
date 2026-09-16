import api from "@/lib/axios";

export interface KasRecord {
  id: string;
  date: string;
  description: string;
  category?: string;
  type: "IN" | "OUT";
  amount: number;
  balance: number;
  notes?: string;
  uploaded_by?: string;
  created_at?: string;
}

export interface KasSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
  totalTransaksi: number;
}

export interface KasResponse {
  success: boolean;
  summary: KasSummary;
  data: KasRecord[];
}

export interface KasUnpaidRecord {
  id: string;
  member_name: string;
  npm?: string;
  division?: string;
  period: string;
  amount: number;
  status: "BELUM_BAYAR" | "LUNAS";
  notes?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KasUnpaidSummary {
  totalBelumBayar: number;
  totalLunas: number;
  totalTunggakan: number;
  totalAnggota: number;
}

export interface KasUnpaidResponse {
  success: boolean;
  summary: KasUnpaidSummary;
  data: KasUnpaidRecord[];
}

export const kasService = {
  async getAll(): Promise<KasResponse> {
    const res = await api.get("/kas");
    return res.data;
  },

  async create(data: {
    date?: string;
    description: string;
    category?: string;
    type: "IN" | "OUT";
    amount: number;
    notes?: string;
  }): Promise<{ success: boolean; data: KasRecord }> {
    const res = await api.post("/kas", data);
    return res.data;
  },

  async uploadExcel(file: File, replace: boolean = false): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/kas/upload?replace=${replace}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async uploadJSON(items: any[], replace: boolean = false): Promise<{ success: boolean; message: string }> {
    const res = await api.post(`/kas/upload?replace=${replace}`, { items });
    return res.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/kas/${id}`);
    return res.data;
  },

  async deleteAll(): Promise<{ success: boolean; message: string }> {
    const res = await api.delete("/kas/reset/all");
    return res.data;
  },

  // ===== UNPAID KAS METHODS =====
  async getUnpaid(): Promise<KasUnpaidResponse> {
    const res = await api.get("/kas/unpaid");
    return res.data;
  },

  async createUnpaid(data: {
    member_name: string;
    npm?: string;
    division?: string;
    period: string;
    amount: number;
    status?: "BELUM_BAYAR" | "LUNAS";
    notes?: string;
  }): Promise<{ success: boolean; data: KasUnpaidRecord }> {
    const res = await api.post("/kas/unpaid", data);
    return res.data;
  },

  async updateUnpaid(
    id: string,
    data: Partial<{
      member_name: string;
      npm: string;
      division: string;
      period: string;
      amount: number;
      status: "BELUM_BAYAR" | "LUNAS";
      notes: string;
    }>
  ): Promise<{ success: boolean; data: KasUnpaidRecord }> {
    const res = await api.put(`/kas/unpaid/${id}`, data);
    return res.data;
  },

  async deleteUnpaid(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/kas/unpaid/${id}`);
    return res.data;
  },

  async uploadUnpaidExcel(file: File, replace: boolean = false): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/kas/unpaid/upload?replace=${replace}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async uploadUnpaidJSON(items: any[], replace: boolean = false): Promise<{ success: boolean; message: string }> {
    const res = await api.post(`/kas/unpaid/upload?replace=${replace}`, { items });
    return res.data;
  },
};
