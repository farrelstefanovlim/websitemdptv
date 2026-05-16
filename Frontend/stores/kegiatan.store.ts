import { create } from "zustand";
import { persist } from "zustand/middleware";

export type KegiatanStatus = "draft" | "diajukan" | "disetujui" | "ditolak" | "selesai";

export interface ProposalFile {
  name: string;
  size: number;
  type: string;
  /** base64-encoded file content (for localStorage demo) */
  data: string;
  uploadedAt: string;
}

export interface Kegiatan {
  id: string;
  title: string;
  description: string;
  division: string;
  date: string;
  location: string;
  status: KegiatanStatus;
  pic: string;
  budget: string;
  proposal: ProposalFile | null;
  notes: string;
  createdAt: string;
}

interface KegiatanState {
  items: Kegiatan[];
  addKegiatan: (k: Omit<Kegiatan, "id" | "createdAt">) => void;
  updateKegiatan: (id: string, data: Partial<Kegiatan>) => void;
  removeKegiatan: (id: string) => void;
  setProposal: (id: string, file: ProposalFile | null) => void;
}

const DUMMY: Kegiatan[] = [
  {
    id: "keg-001", title: "Workshop Cinematography", description: "Workshop teknik sinematografi dasar untuk anggota baru MDPTV.", division: "Photography & Videography",
    date: "2026-06-15", location: "Lab Multimedia Lt.3", status: "disetujui", pic: "Ahmad Rizky", budget: "Rp 2.500.000", proposal: null, notes: "Sudah dikonfirmasi ruangan.", createdAt: "2026-05-01",
  },
  {
    id: "keg-002", title: "Seminar AI in Media", description: "Seminar nasional tentang peran AI dalam produksi media modern.", division: "Kominfo",
    date: "2026-07-20", location: "Auditorium MDP", status: "diajukan", pic: "Siti Nurhaliza", budget: "Rp 8.000.000", proposal: null, notes: "", createdAt: "2026-05-10",
  },
  {
    id: "keg-003", title: "Design Sprint Challenge", description: "Kompetisi desain grafis antar divisi selama 3 hari.", division: "Graphic Design",
    date: "2026-08-05", location: "Ruang Kreatif Lt.2", status: "draft", pic: "Budi Santoso", budget: "Rp 1.500.000", proposal: null, notes: "Perlu sponsorship.", createdAt: "2026-05-14",
  },
  {
    id: "keg-004", title: "Annual Showcase 2026", description: "Pameran karya tahunan MDPTV untuk publik dan stakeholder.", division: "All Division",
    date: "2026-12-10", location: "Hall Utama MDP", status: "draft", pic: "Diana Putri", budget: "Rp 15.000.000", proposal: null, notes: "", createdAt: "2026-05-16",
  },
  {
    id: "keg-005", title: "Pelatihan Social Media", description: "Pelatihan strategi konten dan analytics platform sosial media.", division: "Kominfo",
    date: "2026-06-28", location: "Lab Komputer Lt.4", status: "ditolak", pic: "Eko Prasetyo", budget: "Rp 1.000.000", proposal: null, notes: "Budget kurang detail, revisi ulang.", createdAt: "2026-04-20",
  },
];

export const useKegiatanStore = create<KegiatanState>()(
  persist(
    (set) => ({
      items: DUMMY,
      addKegiatan: (k) =>
        set((s) => ({
          items: [
            { ...k, id: `keg-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] },
            ...s.items,
          ],
        })),
      updateKegiatan: (id, data) =>
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      removeKegiatan: (id) =>
        set((s) => ({ items: s.items.filter((item) => item.id !== id) })),
      setProposal: (id, file) =>
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, proposal: file } : item)),
        })),
    }),
    { name: "mdptv-kegiatan" }
  )
);
