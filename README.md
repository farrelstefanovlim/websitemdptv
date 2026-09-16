# MDPTV Monorepo Project 🚀

Repositori ini berisi proyek **MDPTV** yang terbagi menjadi dua aplikasi utama:

- **Frontend**: website publik dan admin panel berbasis **Next.js 16**
- **Backend**: REST API berbasis **Bun + Express.js + Prisma + PostgreSQL**

---

## 🏗️ Struktur Workspace

```text
websitemdptv-v2/
├── Backend/                  # API server dan business logic
│   ├── prisma/               # Schema Prisma, migrations, seed
│   ├── src/                  # Application source code
│   ├── .env.example          # Template env backend
│   ├── package.json          # Script backend
│   ├── README.md             # Dokumentasi backend
│   └── tsconfig.json         # TypeScript config backend
│
├── Frontend/                 # Aplikasi Next.js
│   ├── app/                  # Halaman dan layout app router
│   ├── components/           # UI & feature components
│   ├── lib/                  # Utility client, axios, image, pdf, excel
│   ├── services/             # API clients per fitur
│   ├── stores/               # Zustand stores
│   ├── .env.example          # Template env frontend
│   ├── package.json          # Script frontend
│   ├── README.md             # Dokumentasi frontend
│   └── tsconfig.json         # TypeScript config frontend
│
├── README.md                 # Dokumentasi monorepo utama
└── .gitignore                # Konfigurasi git
```

---

## ⚙️ Teknologi Utama

### Frontend

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Framer Motion
- Zustand
- Axios
- XLSX / jsPDF

### Backend

- Bun runtime
- Express.js 4
- TypeScript
- Prisma ORM
- PostgreSQL / Supabase
- Redis
- ImageKit
- JWT + Cookie Authentication
- Zod validation

---

## 🚀 Menjalankan Proyek di Lokal

### 1. Backend

```bash
cd Backend
cp .env.example .env
bun install
bun run dev
```

Backend berjalan di:

- `http://localhost:3005`
- API prefix: `http://localhost:3005/api/v1`
- Health check: `http://localhost:3005/api/v1/health`

### 2. Frontend

```bash
cd Frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend berjalan di:

- `http://localhost:3000`

---

## 🧭 Dokumentasi Detail

- [Backend/README.md](Backend/README.md) — panduan penuh backend, konfigurasi, modul API, dan arsitektur
- [Frontend/README.md](Frontend/README.md) — panduan frontend, feature utama, dan arsitektur UI
- [Backend/.env.example](Backend/.env.example) — template env backend
- [Frontend/.env.example](Frontend/.env.example) — template env frontend

---

## ✅ Catatan Penting

- Port backend default adalah `3005` dan bukan `5000`.
- Frontend mengakses backend melalui `NEXT_PUBLIC_API_URL`.
- Untuk produksi, pastikan `CORS_ORIGIN` dan `NEXT_PUBLIC_API_URL` disesuaikan dengan domain yang benar.
- Logo aplikasi sudah dikonfigurasi untuk mendukung format `PNG`.

---

## 🔗 Ringkasan Proyek

Proyek ini menggabungkan:

- Website publik MDPTV untuk calon anggota dan pengguna umum
- Admin panel untuk pengelolaan organisasi
- Sistem pendaftaran, wawancara, absensi, kas, kegiatan, galeri, dan konten CMS
- API backend yang stabil dan terstruktur untuk kebutuhan operasional organisasi

* **`GET /api/users`** — Mengambil seluruh daftar data user yang terdaftar di database in-memory.
