import { PrismaClient } from '../generated/prisma/client';
import { BunHashService } from '../src/infrastructure/services/BunHashService';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Menggunakan PrismaPg driver adapter layaknya pada Prisma v7
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hashService = new BunHashService();

async function main() {
  console.log("Mulai melakukan seeding database...");

  // 1. Site Settings
  await prisma.siteSetting.upsert({
    where: { key: 'registration_open' },
    update: {},
    create: {
      key: 'registration_open',
      value: true
    }
  });

  // 2. Divisions
  const initialDivisions = [
    { name: 'Photography & Videography', subtitle: 'VISUAL STORYTELLING', order: 1 },
    { name: 'Graphic Design', subtitle: 'IDENTITY & LAYOUT', order: 2 },
    { name: 'Kominfo', subtitle: 'INFORMATION HUB', order: 3 },
    { name: 'Pengelola Sumber Daya Manusia', subtitle: 'HUMAN RESOURCES & TALENT DEVELOPMENT', order: 4 },
    { name: 'Hubungan Masyarakat', subtitle: 'PUBLIC RELATIONS & PARTNERSHIPS', order: 5 },
  ];

  for (const div of initialDivisions) {
    await prisma.division.upsert({
      where: { name: div.name },
      update: { subtitle: div.subtitle, order: div.order },
      create: div,
    });
  }

  // 3. Superadmin User
  const passwordHash = await hashService.hash('superadmin123');
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      full_name: 'Super Administrator',
      email: 'admin@mdptv.com',
      role: 'superadmin',
      password_hash: passwordHash,
      is_active: true
    }
  });

  // 4. Layout Sections & Contents
  const sections = [
    {
      key: 'hero',
      label: 'Hero Section',
      order: 1,
      content: {
        badgeText: "Established 2024",
        titleLine1: "MDPTV: CREATIVE",
        titleLine2: "Excellence in Media",
        description: "Wadah bagi para kreator muda Universitas Multi Data Palembang untuk mengeksplorasi batas teknologi media dan seni visual.",
        buttonPrimary: "Lihat Galeri",
        buttonSecondary: "Tentang Kami",
        stats: [
          { value: "50+", label: "Active Members" },
          { value: "120+", label: "Projects" },
          { value: "5+", label: "Divisions" },
        ],
        image: "https://i.pinimg.com/1200x/65/0e/80/650e807f610ffe0df4b057f1e0dbb5f6.jpg"
      }
    },
    {
      key: 'about',
      label: 'About Us',
      order: 2,
      content: {
        label: "Our Vision",
        headingLine1: "Masa Depan Media",
        headingLine2: "Dimulai di Sini",
        description: "UKM MDPTV Universitas Multi Data Palembang bukan sekadar organisasi mahasiswa. Kami adalah laboratorium kreatif tempat inovasi bertemu dengan eksekusi visual yang presisi.",
        features: [
          { icon: "bolt", title: "Inovasi Teknologi Terkini", description: "Menerapkan tren multimedia terbaru dalam setiap karya." },
          { icon: "groups", title: "Kolaborasi Lintas Disiplin", description: "Menyatukan berbagai bakat dari fotografi hingga IT." },
          { icon: "verified", title: "Standar Studio Profesional", description: "Hasil karya dengan kualitas yang diakui industri." },
        ],
        image: "https://i.pinimg.com/736x/75/57/f1/7557f1e58b18c5dcb21efd283e0bb48a.jpg"
      }
    },
    {
      key: 'divisions',
      label: 'Our Divisions',
      order: 3,
      content: {
        label: "Our Expertise",
        headingBold: "Divisi",
        headingItalic: "Spesialisasi",
        description: "Lima pilar utama yang membentuk ekosistem kreatif dan tata kelola di MDPTV.",
        divisions: [
          {
            title: "Photography & Videography",
            subtitle: "VISUAL STORYTELLING",
            description: "Menangkap momen dan merangkai narasi visual melalui lensa dengan standar sinematografi tinggi.",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiZlRZqqTnnWd0G44h6NFUk5MZGCEAqOaUbt9PCh8jFMcZ6KyYekvNTyqqayhnaZRLlYlLEzzYs_i83CH34eFfVqaaYFCtxJipqRHoqlDwmyKBxXLVzubaTNdsIUfMQ_Be7LXj4BfW2NsIh6DGyfOxdb5AzUrneAo_Zr0Rx-Jm2lASh-eCVARMh-RLvUwDK1W7XojLUXsSlrf_hcIp71PAbebvbtDmwr5ar5NATyPIGidnt88RIDuoaxygn89cxF8hqw7veqkl-LBN",
            icon: "photo_camera",
            features: ["Studio Production", "Field Documentation", "Post-Processing"]
          },
          {
            title: "Graphic Design",
            subtitle: "IDENTITY & LAYOUT",
            description: "Eksplorasi identitas visual, tipografi modern, dan desain user interface.",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvAlHRGFnEg-9VzjA5IdT1TvIpNSpd9Y4yq7xzeIXwmdvi6Q437GAAz7SVCQ4Ry5I8IhfJ8dFw66Gx2zZneSMDFmpQy0Knlj9imau-ZzucMtjHC6r1dkEUSnpexdBO6Nvy1YQxeJbIm1Cc4GiLy4uCkJ3_TeRrPaYk3v1DzCHNInLiYTGqVm8PK94Zyh6RwJU0vDCGNlllGw-jo_UNloy8DTBjBK8pqb8rbAFzaexqiVwqUrWl84Pcik4pETRVWL4qDql-aSndO0HD",
            icon: "palette",
            features: ["Branding", "Digital Illustration", "UI/UX Design"]
          },
          {
            title: "Kominfo",
            subtitle: "INFORMATION HUB",
            description: "Menjembatani informasi dan teknologi komunikasi untuk memperkuat jangkauan digital.",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3YPirtyYQqUulGH_4ce37GHXSDyI5GIagMVsb7mGo-LhxxvOXh1HxHinJd0jdRWIDhrfWsKDuRsXsdOa91QHqsOjSLvyv2wU6gErgwTk4vKvRke7qmUDoiExVzhmqhJilOwWrhlo_vpgJQW76zI5qRjdppZg_O-nQm6gLvF0Z_SkQ0_5rX7zH-ZDN_x78ayUaBFcsnZnFyASb0IuGer9h-YMxwE2gp5elbv2yBQMSNC_QYDSf8jV5cQWWmopcpTCCLag8aTdBKwSy",
            icon: "hub",
            features: ["Social Media", "Digital Publishing", "IT Infrastructure"]
          },
          {
            title: "Pengelola Sumber Daya Manusia",
            subtitle: "HUMAN RESOURCES & TALENT DEVELOPMENT",
            description: "Mengembangkan potensi anggota, membina kaderisasi berkualitas, dan merawat dinamika internal organisasi.",
            image: "",
            icon: "badge",
            features: ["Talent Development", "Kaderisasi & Orientasi", "Internal Engagement"]
          },
          {
            title: "Hubungan Masyarakat",
            subtitle: "PUBLIC RELATIONS & PARTNERSHIPS",
            description: "Membangun relasi strategis, memperluas jaringan kemitraan eksternal, dan menjaga citra positif MDPTV.",
            image: "",
            icon: "campaign",
            features: ["Media Partnership", "External Relations", "Event Sponsorship"]
          }
        ]
      }
    },
    {
      key: 'documentation',
      label: 'Documentation',
      order: 4,
      content: {
        badgeText: "The Gallery",
        headingBold: "Dokumentasi",
        headingItalic: "Kegiatan",
        description: "Intip perjalanan kreatif kami.",
        buttonText: "LIHAT GALERI LENGKAP",
        galleryItems: [] // Gallery uses external GalleryImage relation in backend
      }
    },
    { key: 'faq', label: 'FAQ', order: 5, content: { headingBold: "Pertanyaan yang", headingItalic: "Sering Ditanyakan", items: [] } },
  ];

  for (const s of sections) {
    await prisma.layoutSection.upsert({
      where: { section_key: s.key },
      update: {},
      create: {
        section_key: s.key,
        label: s.label,
        order: s.order,
        visible: true
      }
    });

    await prisma.sectionContent.upsert({
      where: { section_key: s.key },
      update: { content: s.content },
      create: {
        section_key: s.key,
        content: s.content
      }
    });
  }

  console.log("✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("Gagal saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
