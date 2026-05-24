export type KegiatanStatus = "draft" | "diajukan" | "disetujui" | "ditolak" | "selesai";

export interface ProposalFile {
  name: string;
  size: number;
  type: string;
  /** base64-encoded file content (for localStorage demo) */
  data?: string;
  /** URL to the file (from API) */
  url?: string;
  uploadedAt?: string;
}

export interface Kegiatan {
  id: string;
  title: string;
  description?: string;
  division: string;
  date: string;
  location?: string;
  status: KegiatanStatus;
  pic: string;
  budget?: string;
  proposal?: ProposalFile | null;
  notes?: string;
  createdAt: string;
}
