# MDPTV Frontend Web Application 🌐

Aplikasi frontend untuk website dan admin panel **MDPTV**. Dibangun dengan **Next.js 16 App Router**, **TypeScript**, **Tailwind CSS**, dan **Zustand** untuk pengalaman admin yang cepat, responsif, dan mudah dikelola.

---

## 🧩 Struktur Aplikasi

```text
Frontend/
├── app/                   # Next.js App Router
│   ├── admin/             # Admin dashboard & CMS pages
│   ├── daftar/            # Halaman pendaftaran anggota baru
│   ├── galeri/            # Galeri media dan dokumentasi
│   ├── login/             # Halaman login admin
│   ├── pengumuman/        # Halaman pengumuman penerimaan
│   ├── privacy-policy/    # Kebijakan privasi
│   ├── terms-of-service/  # Ketentuan layanan
│   ├── globals.css        # Global styling & Tailwind layer
│   ├── layout.tsx         # Root layout dan metadata aplikasi
│   └── page.tsx           # Landing page utama
├── components/            # UI Components reusable
│   ├── feature/           # Komponen spesifik fitur (kas, recruitment, absensi, dll)
│   ├── layout/            # Navbar, Sidebar, Footer, Container
│   └── ui/                # Design system ui primitive (Button, Card, Modal, Badge, Alert)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility helpers: axios, image, pdf, excel, mhsLookup
├── public/                # Aset statis (logo, banner, icons)
├── services/              # API service layer untuk setiap domain fitur
├── stores/                # Zustand stores (auth, recruitment, attendance, layoutConfig, dll)
├── app.config.ts?         # Tidak wajib; menyesuaikan kebutuhan proyek
├── next.config.ts         # Konfigurasi Next.js
├── package.json           # Script dan dependency frontend
├── tsconfig.json          # TypeScript config
└── .env.example           # Template environment frontend
```

---

## ⚙️ Teknologi yang Digunakan

| Teknologi                       | Fungsi                                      |
| :------------------------------ | :------------------------------------------ |
| **Next.js 16**                  | App Router, SSR/CSR hybrid, routing modern  |
| **React 19**                    | UI library utama                            |
| **TypeScript**                  | Type-safety untuk frontend                  |
| **Tailwind CSS v4**             | Utility-first styling                       |
| **Zustand**                     | State management global                     |
| **Framer Motion**               | Animasi UI dan micro-interactions           |
| **Axios**                       | HTTP client untuk komunikasi dengan backend |
| **XLSX / jsPDF**                | Export data ke Excel dan PDF                |
| **ImageKit / upload utilities** | Handling media dan asset website            |

---

## 🚀 Persiapan Lokal

### 1. Prasyarat

Pastikan Anda sudah menginstal:

- Node.js 18+ atau versi yang kompatibel
- Package manager `npm`, `pnpm`, atau `bun`

### 2. Instalasi dependency

```bash
cd Frontend
npm install
# atau
bun install
```

### 3. Konfigurasi environment

Salin `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi variabel berikut:

```env
NEXT_PUBLIC_API_URL="http://localhost:3005/api/v1"
```

> Nilai ini digunakan oleh [Frontend/lib/axios.ts](Frontend/lib/axios.ts) untuk membangun client HTTP utama menuju backend.

---

## ▶️ Menjalankan Aplikasi

```bash
# Mode development
npm run dev
# atau
bun run dev
```

Akses aplikasi di:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3005/api/v1`

---

## 🔧 Script yang Tersedia

```bash
npm run dev      # Development mode dengan hot reload
npm run build    # Build production
npm run start    # Menjalankan build production
npm run lint     # Validasi ESLint
```

---

## 📦 Fitur Utama Frontend

### Public Website

- Landing page utama MDPTV
- Halaman pendaftaran baru (`/daftar`)
- Halaman pengumuman (`/pengumuman`)
- Galeri media (`/galeri`)
- Kebijakan privasi & syarat layanan
- Form dan alur penerimaan anggota baru

### Admin Dashboard

- Dashboard ringkasan statistik
- Manajemen anggota
- Manajemen user / akses admin
- Penerimaan & wawancara
- Kegiatan dan event
- Kas / keuangan
- Absensi
- CMS / layout editor
- Upload media

---

## 🗂️ State Management (Zustand)

Store utama yang dipakai untuk state aplikasi:

- `auth.store.ts` — autentikasi & sesi login
- `recruitment.store.ts` — periode, status, dan pendaftar
- `attendance.store.ts` — absensi per sesi & check-in
- `kegiatan.store.ts` — data kegiatan organisasi
- `member.store.ts` — data anggota
- `user.store.ts` — data pengguna admin
- `gallery.store.ts` — data galeri media
- `layoutConfig.store.ts` — konfigurasi tata letak halaman
- `sectionContent.store.ts` — konten CMS untuk section website
- `toast.store.ts` — notifikasi global

---

## 🧱 Peta Fitur Utama

Beberapa fitur utama dikelola melalui folder `components/feature/` dan `services/`, contohnya:

- `feature/recruitment/` — pendaftaran, periode, kelulusan, wawancara
- `feature/absensi/` — presensi, sesi, QR check-in
- `feature/kas/` — transaksi dan rekap kas
- `feature/kegiatan/` — CRUD event & kegiatan
- `feature/members/` — profil anggota dan data organisasi
- `feature/users/` — pengguna dan role akses
- `feature/content/` — CMS website content editor
- `feature/dashboard/` — ringkasan & analytics admin

---

## 🛡️ Catatan Pengembangan

- Semua request API diarahkan melalui [Frontend/lib/axios.ts](Frontend/lib/axios.ts) agar konfigurasi base URL konsisten.
- Konfigurasi asset media (gambar/logo) dikelola melalui [Frontend/lib/image.ts](Frontend/lib/image.ts).
- Untuk kebutuhan file dokumen, PDF, dan Excel, gunakan utilitas di folder [Frontend/lib](Frontend/lib).
- Penamaan store dan service dibuat agar modular dan mudah diperluas per domain fitur.

---

## 📎 Referensi Cepat

- Backend API: [Backend/README.md](Backend/README.md)
- Root workspace overview: [README.md](README.md)
- Environment template frontend: [.env.example](.env.example)
- Environment template backend: [Backend/.env.example](Backend/.env.example)
