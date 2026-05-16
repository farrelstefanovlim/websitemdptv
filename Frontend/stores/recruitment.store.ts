import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Applicant,
  RecruitmentStatus,
} from "@/components/feature/recruitment/types/recruitment.type";

const DEFAULT_APPLICANTS: Applicant[] = [
  {
    id: "a1", name: "Andi Pratama", nim: "2024001", email: "andi@students.mdp.ac.id",
    phone: "081234567890", division: "Photography & Videography",
    motivation: "Saya ingin mengembangkan kemampuan videografi dan storytelling visual. Sudah punya pengalaman membuat konten YouTube selama 2 tahun.",
    status: "pending", adminNote: "", appliedAt: "2026-05-01",
  },
  {
    id: "a2", name: "Bella Oktaviani", nim: "2024002", email: "bella@students.mdp.ac.id",
    phone: "081234567891", division: "Graphic Design",
    motivation: "Passionate di bidang desain grafis, menguasai Adobe Illustrator dan Figma. Ingin berkontribusi membuat identitas visual MDPTV.",
    status: "interview", adminNote: "Portfolio bagus", appliedAt: "2026-05-02",
  },
  {
    id: "a3", name: "Cahya Dwi", nim: "2024003", email: "cahya@students.mdp.ac.id",
    phone: "081234567892", division: "Kominfo",
    motivation: "Berpengalaman mengelola media sosial organisasi di SMA. Ingin belajar lebih lanjut tentang digital marketing.",
    status: "accepted", adminNote: "Pengalaman bagus di media sosial", appliedAt: "2026-04-28",
  },
  {
    id: "a4", name: "Dimas Kurniawan", nim: "2024004", email: "dimas@students.mdp.ac.id",
    phone: "081234567893", division: "Photography & Videography",
    motivation: "Hobi fotografi sejak SMP, punya kamera DSLR sendiri. Ingin belajar teknik studio dan lighting profesional.",
    status: "accepted", adminNote: "Sudah punya peralatan sendiri, cocok untuk divisi ini", appliedAt: "2026-05-03",
  },
  {
    id: "a5", name: "Eva Susanti", nim: "2024005", email: "eva@students.mdp.ac.id",
    phone: "081234567894", division: "Graphic Design",
    motivation: "Tertarik UI/UX design dan ingin membuat karya visual yang impactful bagi kampus.",
    status: "pending", adminNote: "", appliedAt: "2026-05-05",
  },
  {
    id: "a6", name: "Fajar Ramadhan", nim: "2024006", email: "fajar@students.mdp.ac.id",
    phone: "081234567895", division: "Photography & Videography",
    motivation: "Ingin belajar drone videography dan aerial photography untuk dokumentasi event kampus.",
    status: "interview", adminNote: "Perlu cek schedule", appliedAt: "2026-05-04",
  },
  {
    id: "a7", name: "Gina Maharani", nim: "2024007", email: "gina@students.mdp.ac.id",
    phone: "081234567896", division: "Kominfo",
    motivation: "Punya kemampuan copywriting dan content planning. Ingin membangun komunitas online MDPTV yang lebih engage.",
    status: "pending", adminNote: "", appliedAt: "2026-05-06",
  },
  {
    id: "a8", name: "Haris Maulana", nim: "2024008", email: "haris@students.mdp.ac.id",
    phone: "081234567897", division: "Graphic Design",
    motivation: "Menguasai motion graphics dan After Effects. Ingin membuat bumper dan visual effects untuk video MDPTV.",
    status: "rejected", adminNote: "Jadwal bentrok dengan UKM lain", appliedAt: "2026-05-01",
  },
  {
    id: "a9", name: "Intan Permata", nim: "2024009", email: "intan@students.mdp.ac.id",
    phone: "081234567898", division: "Kominfo",
    motivation: "Berpengalaman di bidang public relations di organisasi sekolah. Ingin mengembangkan skill komunikasi digital.",
    status: "interview", adminNote: "Kandidat kuat untuk posisi PR", appliedAt: "2026-05-07",
  },
  {
    id: "a10", name: "Jefri Tanaka", nim: "2024010", email: "jefri@students.mdp.ac.id",
    phone: "081234567899", division: "Photography & Videography",
    motivation: "Punya channel YouTube dengan 5K subscriber. Ingin belajar produksi video yang lebih profesional.",
    status: "pending", adminNote: "", appliedAt: "2026-05-08",
  },
  {
    id: "a11", name: "Kartini Dewi", nim: "2024011", email: "kartini@students.mdp.ac.id",
    phone: "081234567800", division: "Graphic Design",
    motivation: "Suka ilustrasi digital dan character design. Ingin berkontribusi untuk branding visual MDPTV.",
    status: "accepted", adminNote: "Skill ilustrasi sangat baik", appliedAt: "2026-05-02",
  },
  {
    id: "a12", name: "Lukman Hakim", nim: "2024012", email: "lukman@students.mdp.ac.id",
    phone: "081234567801", division: "Kominfo",
    motivation: "Tertarik data analytics untuk mengoptimalkan konten media sosial MDPTV.",
    status: "pending", adminNote: "", appliedAt: "2026-05-09",
  },
  {
    id: "a13", name: "Mega Putri", nim: "2024013", email: "mega@students.mdp.ac.id",
    phone: "081234567802", division: "Photography & Videography",
    motivation: "Berpengalaman sebagai photographer di acara sekolah. Ingin belajar editing video profesional.",
    status: "rejected", adminNote: "Belum memenuhi kriteria minimal", appliedAt: "2026-05-03",
  },
  {
    id: "a14", name: "Naufal Rizky", nim: "2024014", email: "naufal@students.mdp.ac.id",
    phone: "081234567803", division: "Graphic Design",
    motivation: "Menguasai Canva dan mulai belajar Adobe Creative Suite. Sangat antusias bergabung.",
    status: "interview", adminNote: "Antusiasme tinggi, perlu evaluasi skill", appliedAt: "2026-05-10",
  },
  {
    id: "a15", name: "Olivia Chen", nim: "2024015", email: "olivia@students.mdp.ac.id",
    phone: "081234567804", division: "Kominfo",
    motivation: "Berpengalaman sebagai admin media sosial online shop. Ingin mengaplikasikan skill di organisasi kampus.",
    status: "accepted", adminNote: "Pengalaman sangat relevan", appliedAt: "2026-05-04",
  },
];

interface RecruitmentState {
  registrationOpen: boolean;
  applicants: Applicant[];
  toggleRegistration: () => void;
  addApplicant: (data: Omit<Applicant, "id" | "status" | "adminNote" | "appliedAt">) => void;
  updateStatus: (id: string, status: RecruitmentStatus) => void;
  updateNote: (id: string, note: string) => void;
}

export const useRecruitmentStore = create<RecruitmentState>()(
  persist(
    (set) => ({
      registrationOpen: true,
      applicants: DEFAULT_APPLICANTS,

      toggleRegistration: () =>
        set((state) => ({ registrationOpen: !state.registrationOpen })),

      addApplicant: (data) =>
        set((state) => ({
          applicants: [
            {
              ...data,
              id: `a-${Date.now()}`,
              status: "pending" as RecruitmentStatus,
              adminNote: "",
              appliedAt: new Date().toISOString().split("T")[0],
            },
            ...state.applicants,
          ],
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          applicants: state.applicants.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),

      updateNote: (id, note) =>
        set((state) => ({
          applicants: state.applicants.map((a) =>
            a.id === id ? { ...a, adminNote: note } : a
          ),
        })),
    }),
    { name: "mdptv-recruitment" }
  )
);
