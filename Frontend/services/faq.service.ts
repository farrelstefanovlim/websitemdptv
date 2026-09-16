import api from "@/lib/axios";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const faqService = {
  async getAll(params?: { category?: string; search?: string }): Promise<{ success: boolean; data: FaqItem[] }> {
    const res = await api.get("/faqs", { params });
    return res.data;
  },

  async create(data: {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    is_active?: boolean;
  }): Promise<{ success: boolean; data: FaqItem }> {
    const res = await api.post("/faqs", data);
    return res.data;
  },

  async update(
    id: string,
    data: Partial<{
      question: string;
      answer: string;
      category: string;
      order: number;
      is_active: boolean;
    }>
  ): Promise<{ success: boolean; data: FaqItem }> {
    const res = await api.put(`/faqs/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/faqs/${id}`);
    return res.data;
  },
};
