import api from "@/lib/axios";

export interface InterviewQuestion {
  id: string;
  year_period: number;
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
  year_period: number;
  candidate_name: string;
  interviewer_name?: string;
  interview_date: string;
  answers: InterviewAnswer[];
  notes?: string;
  created_at?: string;
}

export const wawancaraService = {
  async getYears(): Promise<{ success: boolean; data: number[] }> {
    const res = await api.get("/wawancara/years");
    return res.data;
  },

  async createYear(year: number, title?: string): Promise<{ success: boolean; data: any }> {
    const res = await api.post("/wawancara/years", { year, title });
    return res.data;
  },

  async deleteYear(year: number): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/wawancara/years/${year}`);
    return res.data;
  },

  async getQuestions(year: number): Promise<{ success: boolean; data: InterviewQuestion[] }> {
    const res = await api.get(`/wawancara/questions?year=${year}`);
    return res.data;
  },

  async createQuestion(data: {
    year_period: number;
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
      year_period: number;
    }>
  ): Promise<{ success: boolean; data: InterviewQuestion }> {
    const res = await api.put(`/wawancara/questions/${id}`, data);
    return res.data;
  },

  async deleteQuestion(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/wawancara/questions/${id}`);
    return res.data;
  },

  async getResponses(year: number): Promise<{ success: boolean; data: InterviewResponseLog[] }> {
    const res = await api.get(`/wawancara/responses?year=${year}`);
    return res.data;
  },

  async submitResponse(data: {
    year_period: number;
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
