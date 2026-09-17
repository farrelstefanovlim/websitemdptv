import api from "@/lib/axios";

export interface InterviewQuestion {
  id: string;
  year_period: number | string;
  question_text: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  options?: string[] | null;
  order: number;
  created_at?: string;
}

export interface InterviewAnswer {
  question_id: string;
  question_text: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  answer_text: string;
}

export interface InterviewResponseLog {
  id: string;
  year_period: number | string;
  candidate_name: string;
  interviewer_name?: string;
  interview_date: string;
  answers: InterviewAnswer[];
  notes?: string;
  created_at?: string;
}

export const wawancaraService = {
  async getYears(): Promise<{ success: boolean; data: string[] }> {
    const res = await api.get("/wawancara/years");
    return res.data;
  },

  async createYear(period: string | number, title?: string): Promise<{ success: boolean; data: any }> {
    const res = await api.post("/wawancara/years", { period, title });
    return res.data;
  },

  async deleteYear(period: string | number): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/wawancara/years/${encodeURIComponent(period)}`);
    return res.data;
  },

  async getQuestions(period: string | number): Promise<{ success: boolean; data: InterviewQuestion[] }> {
    const res = await api.get(`/wawancara/questions?year=${encodeURIComponent(period)}`);
    return res.data;
  },

  async createQuestion(data: {
    year_period?: number | string;
    period?: string;
    question_text: string;
    type: "MULTIPLE_CHOICE" | "ESSAY";
    options?: string[];
    order?: number;
  }): Promise<{ success: boolean; data: InterviewQuestion }> {
    const res = await api.post("/wawancara/questions", data);
    return res.data;
  },

  async updateQuestion(
    id: string,
    data: Partial<{
      question_text: string;
      type: "MULTIPLE_CHOICE" | "ESSAY";
      options: string[];
      order: number;
      year_period: number | string;
      period: string;
    }>
  ): Promise<{ success: boolean; data: InterviewQuestion }> {
    const res = await api.put(`/wawancara/questions/${id}`, data);
    return res.data;
  },

  async deleteQuestion(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/wawancara/questions/${id}`);
    return res.data;
  },

  async getResponses(period: string | number): Promise<{ success: boolean; data: InterviewResponseLog[] }> {
    const res = await api.get(`/wawancara/responses?year=${encodeURIComponent(period)}`);
    return res.data;
  },

  async submitResponse(data: {
    year_period?: number | string;
    period?: string;
    candidate_name: string;
    interviewer_name?: string;
    interview_date?: string;
    answers: InterviewAnswer[];
    notes?: string;
  }): Promise<{ success: boolean; data: InterviewResponseLog }> {
    const res = await api.post("/wawancara/responses", data);
    return res.data;
  },

  async deleteResponse(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/wawancara/responses/${id}`);
    return res.data;
  },
};
