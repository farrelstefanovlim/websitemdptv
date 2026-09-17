export type RecruitmentStatus = "pending" | "interview" | "accepted" | "rejected";

export interface InterviewAnswerItem {
  question_id?: string;
  question_text: string;
  type?: string;
  answer_text: string;
}

export interface InterviewResult {
  id: string;
  candidate_name: string;
  interviewer_name?: string | null;
  interview_date: string;
  answers: InterviewAnswerItem[];
  notes?: string | null;
  year_period?: number;
}

export interface Applicant {
  id: string;
  name: string;
  npm: string;
  email: string;
  phone: string;
  division: string;
  motivation: string;
  cv_url?: string | null;
  portfolio_url?: string | null;
  period: string;
  status: RecruitmentStatus;
  adminNote: string;
  appliedAt: string;
  interviewResult?: InterviewResult | null;
}

export interface RecruitmentPeriodItem {
  id: string;
  period: string;
  title?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface RecruitmentPeriodResponse {
  periods: string[];
  activePeriod: string;
  announcementPeriod: string;
  details: RecruitmentPeriodItem[];
}

export const STATUS_LABELS: Record<RecruitmentStatus, string> = {
  pending: "Pending",
  interview: "Interview",
  accepted: "Diterima",
  rejected: "Ditolak",
};

export const STATUS_ICONS: Record<RecruitmentStatus, string> = {
  pending: "hourglass_top",
  interview: "mic",
  accepted: "check_circle",
  rejected: "cancel",
};

export const STATUS_COLORS: Record<RecruitmentStatus, { text: string; bg: string; border: string }> = {
  pending: { text: "text-[#f5a623]", bg: "bg-[#f5a623]/10", border: "border-[#f5a623]/20" },
  interview: { text: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
  accepted: { text: "text-[#34d058]", bg: "bg-[#34d058]/10", border: "border-[#34d058]/20" },
  rejected: { text: "text-error", bg: "bg-error/10", border: "border-error/20" },
};
