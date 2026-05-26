import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  HeroStat,
  HeroContent,
  AboutFeature,
  AboutContent,
  DivisionItem,
  DivisionsContent,
  GalleryItem,
  DocumentationContent,
  FaqItem,
  FaqContent,
  CtaContent,
  FooterContent,
} from "@/components/feature/content/types/content.type";

export type * from "@/components/feature/content/types/content.type";

import { cmsService } from "@/services/cms.service";

/* ── Full Store ───────────────────────────────────── */
export interface SectionContentState {
  hero: HeroContent;
  about: AboutContent;
  divisions: DivisionsContent;
  documentation: DocumentationContent;
  faq: FaqContent;
  cta: CtaContent;
  footer: FooterContent;
  isLoading: boolean;
  error: string | null;
  fetchSections: () => Promise<void>;
  updateHero: (data: Partial<HeroContent>) => Promise<void>;
  updateAbout: (data: Partial<AboutContent>) => Promise<void>;
  updateDivisions: (data: Partial<DivisionsContent>) => Promise<void>;
  updateDocumentation: (data: Partial<DocumentationContent>) => Promise<void>;
  updateFaq: (data: Partial<FaqContent>) => Promise<void>;
  updateCta: (data: Partial<CtaContent>) => Promise<void>;
  updateFooter: (data: Partial<FooterContent>) => Promise<void>;
  updateSection: (section: keyof typeof DEFAULTS, data: any) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  resetSection: (section: keyof typeof DEFAULTS) => void;
  resetAll: () => void;
}

/* ── Defaults ─────────────────────────────────────── */

const DEFAULT_HERO: HeroContent = {
  badgeText: "Established 2024",
  titleLine1: "MDPTV: CREATIVE",
  titleLine2: "Excellence in Media",
  description:
    "Wadah bagi para kreator muda Universitas Multi Data Palembang untuk mengeksplorasi batas teknologi media dan seni visual.",
  buttonPrimary: "Lihat Galeri",
  buttonSecondary: "Tentang Kami",
  stats: [
    { value: "50+", label: "Active Members" },
    { value: "120+", label: "Projects" },
    { value: "3+", label: "Divisions" },
  ],
  image: "",
};

const DEFAULT_ABOUT: AboutContent = {
  label: "Our Vision",
  headingLine1: "Masa Depan Media",
  headingLine2: "Dimulai di Sini",
  description:
    "UKM MDPTV Universitas Multi Data Palembang bukan sekadar organisasi mahasiswa. Kami adalah laboratorium kreatif tempat inovasi bertemu dengan eksekusi visual yang presisi.",
  features: [
    { icon: "bolt", title: "Inovasi Teknologi Terkini", description: "Menerapkan tren multimedia terbaru dalam setiap karya." },
    { icon: "groups", title: "Kolaborasi Lintas Disiplin", description: "Menyatukan berbagai bakat dari fotografi hingga IT." },
    { icon: "verified", title: "Standar Studio Profesional", description: "Hasil karya dengan kualitas yang diakui industri." },
  ],
  image: "",
};

const DEFAULT_DIVISIONS: DivisionsContent = {
  label: "Our Expertise",
  headingBold: "Divisi",
  headingItalic: "Spesialisasi",
  description: "Tiga pilar utama yang membentuk ekosistem kreatif di MDPTV.",
  divisions: [
    {
      title: "Photography & Videography",
      subtitle: "VISUAL STORYTELLING",
      description: "Menangkap momen dan merangkai narasi visual melalui lensa dengan standar sinematografi tinggi. Kami berfokus pada teknik pengambilan gambar profesional dan penceritaan visual yang kuat.",
      image: "",
      features: ["Studio Production", "Field Documentation", "Post-Processing Mastery"],
    },
    {
      title: "Graphic Design",
      subtitle: "IDENTITY & LAYOUT",
      description: "Eksplorasi identitas visual, tipografi modern, dan desain user interface yang intuitif dan estetik. Kami menciptakan bahasa visual yang bermakna dan memikat audiens.",
      image: "",
      features: ["Branding & Identity", "Digital Illustration", "UI/UX Design"],
    },
    {
      title: "Kominfo",
      subtitle: "INFORMATION HUB",
      description: "Menjembatani informasi dan teknologi komunikasi untuk memperkuat jangkauan digital organisasi. Kami mengelola aliran informasi dan infrastruktur digital komunitas.",
      image: "",
      features: ["Social Media Management", "Public Relations", "Digital Networking"],
    },
  ],
};

const DEFAULT_DOCUMENTATION: DocumentationContent = {
  badgeText: "The Gallery",
  headingBold: "Dokumentasi",
  headingItalic: "Kegiatan",
  description: "Intip perjalanan kreatif kami melalui berbagai acara dan proyek kolaboratif yang telah kami lalui bersama.",
  buttonText: "LIHAT GALERI LENGKAP",
};

const DEFAULT_FAQ: FaqContent = {
  label: "FAQ",
  headingBold: "Pertanyaan yang",
  headingItalic: "Sering Ditanyakan",
  description: "Temukan jawaban atas pertanyaan umum seputar UKM MDPTV dan proses bergabung bersama kami.",
  items: [
    { question: "Apa itu UKM MDPTV?", answer: "UKM MDPTV adalah Unit Kegiatan Mahasiswa di Universitas Multi Data Palembang yang berfokus pada bidang multimedia, meliputi videografi, fotografi, desain grafis, dan teknologi informasi. Kami menjadi wadah bagi mahasiswa untuk mengembangkan kreativitas dan skill profesional di dunia media." },
    { question: "Siapa saja yang bisa bergabung dengan MDPTV?", answer: "Seluruh mahasiswa aktif Universitas Multi Data Palembang dapat bergabung dengan MDPTV, tanpa memandang program studi atau angkatan. Kami terbuka untuk siapa saja yang memiliki minat dan semangat di bidang multimedia dan produksi konten kreatif." },
    { question: "Bagaimana cara mendaftar menjadi anggota?", answer: "Pendaftaran anggota baru dibuka setiap awal semester melalui formulir online yang diumumkan di media sosial resmi MDPTV. Proses seleksi meliputi pengisian formulir, wawancara singkat, dan masa orientasi anggota baru untuk mengenal lebih dekat divisi-divisi yang tersedia." },
    { question: "Divisi apa saja yang ada di MDPTV?", answer: "MDPTV memiliki beberapa divisi spesialisasi, antara lain Videografi (produksi video dan film pendek), Fotografi (dokumentasi dan fotografi kreatif), Desain Grafis (branding dan visual design), serta IT & Web Development (pengembangan website dan solusi digital)." },
    { question: "Apakah perlu pengalaman sebelumnya untuk bergabung?", answer: "Tidak perlu! Kami menyambut anggota dari semua level, baik pemula maupun yang sudah berpengalaman. MDPTV menyediakan program pelatihan internal, workshop rutin, dan mentoring dari senior untuk membantu setiap anggota berkembang sesuai minatnya." },
    { question: "Apa saja kegiatan rutin MDPTV?", answer: "Kegiatan rutin kami meliputi workshop mingguan, sesi sharing knowledge antar divisi, project kolaboratif untuk klien internal maupun eksternal kampus, serta partisipasi dalam berbagai kompetisi multimedia tingkat regional dan nasional." },
  ],
};

const DEFAULT_CTA: CtaContent = {
  label: "Join The Movement",
  headingLine1: "SIAP MENJADI BAGIAN",
  headingLine2: "Dari Masa Depan?",
  description: "Bergabunglah dengan komunitas kreatif MDPTV dan kembangkan potensimu di dunia multimedia yang terus berkembang.",
  buttonPrimary: "Daftar Sekarang",
  buttonSecondary: "Hubungi Kami",
};

const DEFAULT_FOOTER: FooterContent = {
  instagram: "https://instagram.com/mdptv",
  youtube: "https://youtube.com/@mdptv",
  tiktok: "https://tiktok.com/@mdptv",
  email: "mailto:mdptv@mdp.ac.id",
  whatsapp: "#",
};

export const DEFAULTS = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  divisions: DEFAULT_DIVISIONS,
  documentation: DEFAULT_DOCUMENTATION,
  faq: DEFAULT_FAQ,
  cta: DEFAULT_CTA,
  footer: DEFAULT_FOOTER,
};

/* ── Section key mapping ─────────────────────────── */
const SECTION_KEYS = ["hero", "about", "divisions", "documentation", "faq", "cta", "footer"] as const;

export const useSectionContentStore = create<SectionContentState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      isLoading: false,
      error: null,

      fetchSections: async () => {
        set({ isLoading: true, error: null });
        try {
          const sections = await cmsService.fetchSectionContents();

          const updates: Partial<Record<string, unknown>> = {};
          for (const s of sections) {
            if (s.content && SECTION_KEYS.includes(s.section_key)) {
              updates[s.section_key] = { ...DEFAULTS[s.section_key as keyof typeof DEFAULTS], ...s.content };
            }
          }

          if (Object.keys(updates).length > 0) {
            set({ ...updates, isLoading: false } as any);
          } else {
            set({ isLoading: false });
          }
        } catch {
          // Fallback to defaults if API is unavailable
          set({ isLoading: false });
        }
      },

      updateHero: async (data) => {
        set((s) => ({ hero: { ...s.hero, ...data } }));
        try {
          await cmsService.updateSection("hero", { ...get().hero, ...data });
        } catch { /* optimistic update, ignore API error */ }
      },
      updateAbout: async (data) => {
        set((s) => ({ about: { ...s.about, ...data } }));
        try {
          await cmsService.updateSection("about", { ...get().about, ...data });
        } catch { /* optimistic update */ }
      },
      updateDivisions: async (data) => {
        set((s) => ({ divisions: { ...s.divisions, ...data } }));
        try {
          await cmsService.updateSection("divisions", { ...get().divisions, ...data });
        } catch { /* optimistic update */ }
      },
      updateDocumentation: async (data) => {
        set((s) => ({ documentation: { ...s.documentation, ...data } }));
        try {
          await cmsService.updateSection("documentation", { ...get().documentation, ...data });
        } catch { /* optimistic update */ }
      },
      updateFaq: async (data) => {
        set((s) => ({ faq: { ...s.faq, ...data } }));
        try {
          await cmsService.updateSection("faq", { ...get().faq, ...data });
        } catch { /* optimistic update */ }
      },
      updateCta: async (data) => {
        set((s) => ({ cta: { ...s.cta, ...data } }));
        try {
          await cmsService.updateSection("cta", { ...get().cta, ...data });
        } catch { /* optimistic update */ }
      },
      updateFooter: async (data) => {
        set((s) => ({ footer: { ...s.footer, ...data } }));
        try {
          await cmsService.updateSection("footer", { ...get().footer, ...data });
        } catch { /* optimistic update */ }
      },

      updateSection: async (section, data) => { // Generic updater
        set((s: any) => ({ [section]: { ...s[section], ...data } }));
        try {
          await cmsService.updateSection(section, { ...(get() as any)[section], ...data });
        } catch { /* optimistic update */ }
      },

      uploadImage: async (file: File) => {
        return await cmsService.uploadImage(file);
      },

      resetSection: (section) => set({ [section]: DEFAULTS[section] }),
      resetAll: () => set(DEFAULTS),
    }),
    {
      name: "mdptv-section-content",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
           if (persistedState?.documentation?.galleryItems) {
               delete persistedState.documentation.galleryItems;
           }
        }
        return persistedState;
      }
    }
  )
);
