# MDPTV Backend API Server 🚀

RESTful API backend untuk sistem **MDPTV (Multimedia & Broadcasting Organization)** yang dibangun menggunakan **Bun**, **Express.js**, **TypeScript**, dan **Prisma ORM** dengan prinsip arsitektur **Domain-Driven Design (DDD)**.

---

## 🏛️ Arsitektur Sistem (Domain-Driven Design)

Sistem backend diorganisasikan ke dalam 4 layer terpisah untuk menjamin skalabilitas, modularitas, dan kemudahan pengujian (_testability_):

```text
src/
├── domain/                  # 1. Domain Layer (Jantung Bisnis - Framework Agnostic)
│   ├── entities/            # Business Entities (User, Member, Recruitment, Kegiatan, Kas, dll)
│   ├── value-objects/       # Immutable Value Objects (Email, NIM, TransactionType, dll)
│   ├── repositories/        # Repository Interfaces & Contracts (IUserRepository, dll)
│   └── exceptions/          # Domain Exceptions & Error Definitions
│
├── application/             # 2. Application Layer (Orkestrasi Use Cases)
│   ├── use-cases/           # Alur bisnis (RegisterUser, GetDashboardMetrics, dll)
│   ├── dtos/                # Data Transfer Objects & Response Mappers
│   └── services/            # Application Service Interfaces (IHashService, dll)
│
├── infrastructure/          # 3. Infrastructure Layer (Implementasi Teknis)
│   ├── config/              # Validasi Environment Variable dengan Zod (env.ts)
│   ├── database/            # Prisma Repositories & Database Client (PrismaUserRepository, dll)
│   └── services/            # Concrete Services (BunHashService, ImageKitService, Redis, dll)
│
└── presentation/            # 4. Presentation Layer (HTTP / External Interface)
    └── http/
        ├── controllers/     # Express Controllers (Auth, Recruitment, Kegiatan, Kas, CMS, dll)
        ├── routes/          # Express Routers & Request Validation
        ├── middlewares/     # Error Handlers, Auth Guards, Role Middleware, Rate Limiting
        └── app.ts           # Bootstrapping Express, CORS, Helmet, Cookie Parser & Routing
```

---

## ⚡ Teknologi & Dependensi Utama

| Teknologi / Library       | Versi               | Fungsi                                                               |
| :------------------------ | :------------------ | :------------------------------------------------------------------- |
| **Bun**                   | `^1.1.x`            | Runtime JavaScript/TypeScript berkecepatan tinggi                    |
| **Express.js**            | `^4.19.2`           | Framework HTTP server & routing                                      |
| **Prisma ORM**            | `^7.8.0`            | Object-Relational Mapping & Database Schema Migration                |
| **PostgreSQL / Supabase** | -                   | Database relasional utama (dukungan Transaction Pooler & Direct URL) |
| **Redis (ioredis)**       | `^5.6.1`            | Cache layer & Rate limiting session                                  |
| **ImageKit SDK**          | `^6.0.0`            | CDN & Cloud Storage media upload (Foto kegiatan, profil, berkas)     |
| **Zod**                   | `^3.23.8`           | Validasi skema runtime & type-safety                                 |
| **JSON Web Token**        | `^9.0.2`            | Autentikasi berbasis Access Token & Refresh Token (HTTP-Only Cookie) |
| **Helmet & CORS**         | `^7.1.0` / `^2.8.5` | Proteksi keamanan header HTTP & manajemen origin lintas domain       |

---

## 🛠️ Prasyarat & Instalasi

### 1. Prasyarat

Pastikan Anda sudah menginstal **Bun** pada sistem operasi Anda:

```powershell
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS / Linux
curl -fsSL https://bun.sh/install | bash
```

### 2. Instalasi Dependensi

Masuk ke direktori `Backend` dan jalankan instalasi package:

```bash
cd Backend
bun install
```

### 3. Konfigurasi Environment Variable

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Sesuaikan nilai variabel berikut pada file `.env`:

```env
# Server
PORT=3005
NODE_ENV="development"

# Database (Supabase / PostgreSQL)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Redis Cache (Opsional untuk lokal)
REDIS_URL="redis://localhost:6379"

# Keamanan Autentikasi
JWT_SECRET="kunci_rahasia_jwt_access_token_anda"
JWT_REFRESH_SECRET="kunci_rahasia_jwt_refresh_token_anda"

# Keamanan CORS
CORS_ORIGIN="http://localhost:3000"

# ImageKit (Media CDN)
IMAGEKIT_PUBLIC_KEY="public_xxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxx"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
```

### 4. Database Setup & Prisma Migration

Jalankan sinkronisasi database dan generate Prisma client:

```bash
# Generate Prisma Client
bun run prisma:generate

# Eksekusi migrasi database ke PostgreSQL / Supabase
bun run prisma:migrate

# (Opsional) Seeding data awal admin & konfigurasi default
bun run prisma:seed
```

---

## 🚀 Menjalankan Server

```bash
# Mode Pengembangan (Hot-reload dengan watch mode)
bun run dev

# Build untuk Produksi
bun run build

# Menjalankan Build Produksi
bun run start
```

Server akan aktif secara default di: **`http://localhost:3005`**  
Prefix API: **`http://localhost:3005/api/v1`**

---

## 📡 Ringkasan Modul & API Endpoints

Semua endpoint API terpusat pada prefix `/api/v1`:

### 1. System & Health Check

- `GET /api/v1/health` — Status kesehatan server dan timestamp runtime.

### 2. Autentikasi (`/api/v1/auth`)

- `POST /api/v1/auth/login` — Login admin/pengurus dengan rate limiting.
- `POST /api/v1/auth/refresh` — Refresh access token via cookie token.
- `POST /api/v1/auth/logout` — Logout dan invalidasi sesi.

### 3. Pengguna / Users (`/api/v1/users`)

- `POST /api/v1/users/register` — Pendaftaran akun user baru dengan validasi Zod.
- `GET /api/v1/users` — Ambil daftar seluruh user admin.

### 4. Open Recruitment (`/api/v1/recruitment`)

- `GET /api/v1/recruitment/periods` — Ambil seluruh daftar periode open recruitment (Publik).
- `POST /api/v1/recruitment/periods` — Tambah periode penerimaan baru (Protected).
- `PATCH /api/v1/recruitment/periods/active` — Setel periode aktif (Protected).
- `DELETE /api/v1/recruitment/periods/:period` — Hapus periode tertentu (Protected).
- `GET /api/v1/recruitment/applicants` — Daftar pelamar dengan paginasi, pencarian & filter (Protected).
- `POST /api/v1/recruitment/apply` — Form submit pendaftaran calon anggota baru (Publik).
- `POST /api/v1/recruitment/upload` — Upload berkas CV/Foto pendaftar langsung (Publik).
- `PATCH /api/v1/recruitment/applicants/:id/status` — Update status seleksi & catatan pelamar (Protected).
- `DELETE /api/v1/recruitment/applicants/:id` — Hapus data pelamar (Protected).
- `GET /api/v1/recruitment/announcement` — Cek status pengumuman kelulusan (Publik).
- `PATCH /api/v1/recruitment/announcement/toggle` — Buka/tutup pengumuman kelulusan (Protected).
- `GET /api/v1/recruitment/whatsapp-link` — Ambil link grup WhatsApp pendaftaran (Publik).
- `PUT /api/v1/recruitment/whatsapp-link` — Update link grup WhatsApp pendaftaran (Protected).

### 5. Bank Soal & Wawancara (`/api/v1/wawancara`)

- `GET /api/v1/wawancara/years` / `POST /api/v1/wawancara/years` — Manajemen periode wawancara.
- `GET /api/v1/wawancara/questions` — Daftar bank soal wawancara per periode.
- `POST /api/v1/wawancara/questions` — Tambah butir pertanyaan wawancara.
- `PUT /api/v1/wawancara/questions/:id` — Edit pertanyaan wawancara.
- `DELETE /api/v1/wawancara/questions/:id` — Hapus pertanyaan wawancara.
- `GET /api/v1/wawancara/responses` — Daftar rekap jawaban dan penilaian kandidat.
- `POST /api/v1/wawancara/responses` — Simpan lembar penilaian & nilai kandidat.
- `DELETE /api/v1/wawancara/responses/:id` — Hapus hasil wawancara kandidat.

### 6. Presensi & Absensi (`/api/v1/attendance`)

- `POST /api/v1/attendance` — Input presensi kehadiran anggota (Protected).
- `GET /api/v1/attendance` — Rekapitulasi riwayat presensi anggota (Protected).

### 7. Program Kerja & Kegiatan (`/api/v1/kegiatan`)

- `GET /api/v1/kegiatan` — Daftar program kerja dan kegiatan organisasi.
- `POST /api/v1/kegiatan` — Tambah kegiatan baru (Protected).
- `PUT /api/v1/kegiatan/:id` — Update detail kegiatan (Protected).
- `DELETE /api/v1/kegiatan/:id` — Hapus kegiatan (Protected).
- `PATCH /api/v1/kegiatan/:id/status` — Ubah status approval kegiatan (Protected).
- `POST /api/v1/kegiatan/:id/upload-proposal` — Unggah berkas proposal PDF (Protected).

### 8. Keuangan & Kas (`/api/v1/kas`)

- `GET /api/v1/kas` — Daftar transaksi kas masuk/keluar & saldo berjalan.
- `POST /api/v1/kas` — Catat transaksi kas baru.
- `POST /api/v1/kas/upload` — Bulk import transaksi kas via Excel.
- `DELETE /api/v1/kas/:id` — Hapus catatan transaksi kas.
- `DELETE /api/v1/kas/reset/all` — Reset seluruh catatan kas.
- `GET /api/v1/kas/unpaid` — Daftar tagihan kas anggota yang belum lunas.
- `POST /api/v1/kas/unpaid` / `POST /api/v1/kas/unpaid/upload` — Tambah & import tunggakan kas.
- `PUT /api/v1/kas/unpaid/:id` — Update status tagihan kas.
- `DELETE /api/v1/kas/unpaid/:id` — Hapus data tunggakan kas.

### 9. Anggota & Divisi (`/api/v1/members`, `/api/v1/divisions`)

- `GET /api/v1/members` — Daftar database anggota dan status kepengurusan.
- `POST /api/v1/members` — Tambah anggota baru.
- `PATCH /api/v1/members/:id` — Update data anggota.
- `DELETE /api/v1/members/:id` — Hapus data anggota.
- `PATCH /api/v1/members/:id/feature` — Toggle keaktifan anggota.
- `GET /api/v1/divisions` — Daftar divisi resmi MDPTV.

### 10. CMS & Konten Website (`/api/v1/cms`, `/api/v1/faqs`, `/api/v1/upload`)

- `GET /api/v1/cms/sections` — Ambil konten landing page (Hero, About, Divisions, Documentation, FAQ, Footer) (Publik).
- `PUT /api/v1/cms/sections/:key` — Update konten section tertentu (Protected).
- `PATCH /api/v1/cms/sections/layouts` — Update urutan & visibilitas section (Protected).
- `GET /api/v1/cms/gallery` — Ambil foto galeri kegiatan (Publik).
- `POST /api/v1/cms/gallery` — Tambah foto dokumentasi ke galeri (Protected).
- `DELETE /api/v1/cms/gallery/:id` — Hapus foto galeri (Protected).
- `PATCH /api/v1/cms/gallery/:id/feature` — Toggle status featured foto (Protected).
- `GET /api/v1/faqs` / `POST /api/v1/faqs` / `PUT /api/v1/faqs/:id` / `DELETE /api/v1/faqs/:id` — CRUD FAQ landing page.
- `POST /api/v1/upload` — Upload media umum ke ImageKit CDN (Protected).
- `POST /api/v1/upload/cv` — Upload berkas CV/Foto calon pendaftar ke ImageKit (Publik).

### 11. Dashboard Metrik (`/api/v1/dashboard`)

- `GET /api/v1/dashboard/metrics` — Statistik metrik utama organisasi untuk admin dashboard.

---

## 🛡️ Keamanan & Standar Praktik

1. **Password Security**: Menggunakan native engine hashing `Bun.password` yang aman dari timing attack.
2. **CORS Whitelist**: Origin protektif untuk mencegah unauthorized web client access.
3. **Rate Limiting**: Melindungi API dari serangan brute force dan flood requests.
4. **Prisma Type Safety**: Bebas dari celah SQL Injection dengan parameter binding bawaan.
5. **Decoupled Architecture**: Logika bisnis murni terisolasi di domain & application use-case layer.

```

---

## 🛠️ Panduan Pengembangan: Cara Membuat API Baru

Apabila Anda ingin menambahkan fitur baru (misal: **Product** / Produk), ikuti langkah-langkah terstandar DDD berikut:

### 1. Definisikan di Layer **Domain**

1. Buat entity baru di `src/domain/entities/Product.ts`.
2. Buat value object jika diperlukan di `src/domain/value-objects/`.
3. Definisikan kontrak repositori di `src/domain/repositories/IProductRepository.ts`.

### 2. Buat di Layer **Application**

1. Buat DTO untuk request & response di `src/application/dtos/ProductDto.ts`.
2. Buat use case bisnis di `src/application/use-cases/CreateProductUseCase.ts` yang menginjeksi `IProductRepository`.

### 3. Tulis di Layer **Infrastructure**

1. Buat repositori riil (misal menggunakan Prisma/PostgreSQL) di `src/infrastructure/database/PrismaProductRepository.ts` yang mengimplementasikan `IProductRepository`.

### 4. Daftarkan di Layer **Presentation**

1. Buat controller di `src/presentation/http/controllers/ProductController.ts` untuk menangani routing request.
2. Definisikan route & validasi skema input di `src/presentation/http/routes/productRoutes.ts`.
3. Hubungkan di router utama `src/presentation/http/routes/index.ts`.
4. Lakukan wiring / Dependency Injection objek tersebut di file utama `src/index.ts`.
```
