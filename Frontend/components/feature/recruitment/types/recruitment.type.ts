export type RecruitmentStatus = "pending" | "interview" | "accepted" | "rejected";

export interface Applicant {
  id: string;
  name: string;
  npm: string;
  email: string;
  phone: string;
  division: string;
  motivation: string;
  status: RecruitmentStatus;
  adminNote: string;
  appliedAt: string;
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
