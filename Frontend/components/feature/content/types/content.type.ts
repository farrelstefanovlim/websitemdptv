/* ── Hero ─────────────────────────────────────────── */
export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroContent {
  badgeText: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  buttonPrimary: string;
  buttonSecondary: string;
  image: string;
  stats: HeroStat[];
}

/* ── About ────────────────────────────────────────── */
export interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  label: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  image: string;
  features: AboutFeature[];
}

/* ── Divisions ────────────────────────────────────── */
export interface DivisionItem {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  icon?: string;
}

export interface DivisionsContent {
  label: string;
  headingBold: string;
  headingItalic: string;
  description: string;
  divisions: DivisionItem[];
}

/* ── Documentation ────────────────────────────────── */
export interface GalleryItem {
  id?: string;
  label: string;
  title: string;
  image: string;
  uploadedAt: string;
  featured: boolean;
}

export interface DocumentationContent {
  badgeText: string;
  headingBold: string;
  headingItalic: string;
  description: string;
  buttonText: string;
}

/* ── FAQ ──────────────────────────────────────────── */
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  label: string;
  headingBold: string;
  headingItalic: string;
  description: string;
  items: FaqItem[];
}

/* ── CTA ──────────────────────────────────────────── */
export interface CtaContent {
  label: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  buttonPrimary: string;
  buttonSecondary: string;
}

/* ── Footer ───────────────────────────────────────── */
export interface FooterContent {
  instagram: string;
  youtube: string;
  tiktok: string;
  email: string;
  whatsapp: string;
}
