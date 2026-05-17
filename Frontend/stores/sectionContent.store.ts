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
} from "@/components/feature/content/types/content.type";

export type * from "@/components/feature/content/types/content.type";

/* ── Full Store ───────────────────────────────────── */
export interface SectionContentState {
  hero: HeroContent;
  about: AboutContent;
  divisions: DivisionsContent;
  documentation: DocumentationContent;
  faq: FaqContent;
  cta: CtaContent;
  updateHero: (data: Partial<HeroContent>) => void;
  updateAbout: (data: Partial<AboutContent>) => void;
  updateDivisions: (data: Partial<DivisionsContent>) => void;
  updateDocumentation: (data: Partial<DocumentationContent>) => void;
  updateFaq: (data: Partial<FaqContent>) => void;
  updateCta: (data: Partial<CtaContent>) => void;
  addGalleryItem: (item: GalleryItem) => void;
  removeGalleryItem: (index: number) => void;
  toggleFeatured: (index: number) => void;
  resetSection: (section: "hero" | "about" | "divisions" | "documentation" | "faq" | "cta") => void;
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
  image: "https://i.pinimg.com/1200x/65/0e/80/650e807f610ffe0df4b057f1e0dbb5f6.jpg",
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
  image: "https://i.pinimg.com/736x/75/57/f1/7557f1e58b18c5dcb21efd283e0bb48a.jpg",
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
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiZlRZqqTnnWd0G44h6NFUk5MZGCEAqOaUbt9PCh8jFMcZ6KyYekvNTyqqayhnaZRLlYlLEzzYs_i83CH34eFfVqaaYFCtxJipqRHoqlDwmyKBxXLVzubaTNdsIUfMQ_Be7LXj4BfW2NsIh6DGyfOxdb5AzUrneAo_Zr0Rx-Jm2lASh-eCVARMh-RLvUwDK1W7XojLUXsSlrf_hcIp71PAbebvbtDmwr5ar5NATyPIGidnt88RIDuoaxygn89cxF8hqw7veqkl-LBN",
      features: ["Studio Production", "Field Documentation", "Post-Processing Mastery"],
    },
    {
      title: "Graphic Design",
      subtitle: "IDENTITY & LAYOUT",
      description: "Eksplorasi identitas visual, tipografi modern, dan desain user interface yang intuitif dan estetik. Kami menciptakan bahasa visual yang bermakna dan memikat audiens.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvAlHRGFnEg-9VzjA5IdT1TvIpNSpd9Y4yq7xzeIXwmdvi6Q437GAAz7SVCQ4Ry5I8IhfJ8dFw66Gx2zZneSMDFmpQy0Knlj9imau-ZzucMtjHC6r1dkEUSnpexdBO6Nvy1YQxeJbIm1Cc4GiLy4uCkJ3_TeRrPaYk3v1DzCHNInLiYTGqVm8PK94Zyh6RwJU0vDCGNlllGw-jo_UNloy8DTBjBK8pqb8rbAFzaexqiVwqUrWl84Pcik4pETRVWL4qDql-aSndO0HD",
      features: ["Branding & Identity", "Digital Illustration", "UI/UX Design"],
    },
    {
      title: "Kominfo",
      subtitle: "INFORMATION HUB",
      description: "Menjembatani informasi dan teknologi komunikasi untuk memperkuat jangkauan digital organisasi. Kami mengelola aliran informasi dan infrastruktur digital komunitas.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3YPirtyYQqUulGH_4ce37GHXSDyI5GIagMVsb7mGo-LhxxvOXh1HxHinJd0jdRWIDhrfWsKDuRsXsdOa91QHqsOjSLvyv2wU6gErgwTk4vKvRke7qmUDoiExVzhmqhJilOwWrhlo_vpgJQW76zI5qRjdppZg_O-nQm6gLvF0Z_SkQ0_5rX7zH-ZDN_x78ayUaBFcsnZnFyASb0IuGer9h-YMxwE2gp5elbv2yBQMSNC_QYDSf8jV5cQWWmopcpTCCLag8aTdBKwSy",
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
  galleryItems: [
    { label: "Workshop 2024", title: "Cinematography Masterclass", uploadedAt: "2024-11-15", featured: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCT1yV35d9nsrY8CI0e6KlG3Lhsd2XIaIUkjZLMSHB6-RjTRDEddHtXmGy_CxdWdLgeY3pskCBVet-KedyyEm1Wdyfo309oSKCR7ikmwk2EG3Hnyqa1RKTcVGqQL-pjrGMqE5yrfaRXq4P1XUZwCKkiThLhi11RiVKGX0vOJ5wkTGnWJ1GCVdY6LjX417bNXFmQpp5RYHC9J3fbbjM3htXjZiIAHgw6Xz-egs37JV2D4wUTjr84YxESDggM4klyqQujssYBhrEKmrd-" },
    { label: "Media Talk", title: "The Future of AI in Media", uploadedAt: "2024-12-20", featured: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaK6_CuKFM2pBZaSBCMWonlmoH4Dyvi0uTBOsHw_SPaYhEjP1o4m8rRXzI75dvQDYcsTq3QdUVEJChdKQQe6n8R06FDh5q2QxZX7kK1Uf-7mM6zoNfAZ_6wU_8EVd8029wPsCIko3z8QzwDOWD0aGw774MYb5CD6k8hDFaRdcwvr8VJHqss8j0GIv4eun4QAZXYnB0oWXYl_37xb7QIWQadYYvnpd3CQAsAzxlwjEJ-nY2nwuLBse-gGLnnBKfUTuEKujO4hGgFw3e" },
    { label: "Event", title: "Annual Showcase", uploadedAt: "2025-03-10", featured: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAqgCOScpoKgRqQFUxx5VAlzknvyt8kuDloL28mr_cr1mCDSWD9OrNZFp1RA6Sd1aEr6wRUkOE1K5RUA6mMaxl8yeUl7a8QmJ24X8ztgQlNSxokmEPYd5ZpyhyOT2NzKaBMUC76elLP9kNcQ3E7de2va-TJ0eSXi9jPe_EiuSEgAPgIZ8C_0HWsoFZLpf83NrmmYwp7_bI-dTvB_TX3gKqZrdywOghM7EzSkWSt8nlQcsuwAIsFIU4Et_S-kzzNy8O0UHvuK4vJu_P" },
    { label: "Collaboration", title: "Team Workshop", uploadedAt: "2025-03-10", featured: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmV9ZjlIKadI2aYLUhRvaAnC0CTCC7uXK6uBWg9AreAohyL3wPF589W2FFcfB7peMMH8Av865VVUa2c4D8rJUhe8Mz3pNYfHENcINXdRQu9mAGARTeBTqgqwwTJFXjzot-HK1Mj-NKM3XhyXaPAqNWE47Pe4FyfNFJw9qPvU4yJBry981uegiFl1pMZzRn8fCGBEawTUcEhdR3-ghzsR0Su3CDK9pKsy_2RaVGdGLqd11650tHT1C8QfMHsAl3Kusre8I5SM9XkJD7" },
  ],
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

export const DEFAULTS = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  divisions: DEFAULT_DIVISIONS,
  documentation: DEFAULT_DOCUMENTATION,
  faq: DEFAULT_FAQ,
  cta: DEFAULT_CTA,
};

export const useSectionContentStore = create<SectionContentState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      updateHero: (data) => set((s) => ({ hero: { ...s.hero, ...data } })),
      updateAbout: (data) => set((s) => ({ about: { ...s.about, ...data } })),
      updateDivisions: (data) => set((s) => ({ divisions: { ...s.divisions, ...data } })),
      updateDocumentation: (data) => set((s) => ({ documentation: { ...s.documentation, ...data } })),
      updateFaq: (data) => set((s) => ({ faq: { ...s.faq, ...data } })),
      updateCta: (data) => set((s) => ({ cta: { ...s.cta, ...data } })),

      addGalleryItem: (item) => set((s) => ({
        documentation: {
          ...s.documentation,
          galleryItems: [item, ...s.documentation.galleryItems],
        },
      })),
      removeGalleryItem: (index) => set((s) => ({
        documentation: {
          ...s.documentation,
          galleryItems: s.documentation.galleryItems.filter((_, i) => i !== index),
        },
      })),
      toggleFeatured: (index) => set((s) => ({
        documentation: {
          ...s.documentation,
          galleryItems: s.documentation.galleryItems.map((item, i) =>
            i === index ? { ...item, featured: !item.featured } : item
          ),
        },
      })),

      resetSection: (section) => set({ [section]: DEFAULTS[section] }),
      resetAll: () => set(DEFAULTS),
    }),
    { name: "mdptv-section-content" }
  )
);
