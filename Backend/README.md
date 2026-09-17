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

- `GET /api/v1/health` — Status kesehatan server dan versi runtime.

### 2. Autentikasi (`/api/v1/auth`)

- `POST /api/v1/auth/login` — Login pengguna (Admin, Pengurus, Anggota).
- `POST /api/v1/auth/register` — Pendaftaran akun user baru.
- `POST /api/v1/auth/refresh` — Refresh access token via refresh token.
- `POST /api/v1/auth/logout` — Logout dan invalidasi token.
- `GET /api/v1/auth/me` — Ambil profil user yang sedang login.

### 3. Open Recruitment (`/api/v1/recruitment`)

- `GET /api/v1/recruitment/periods` — Ambil seluruh daftar periode open recruitment.
- `POST /api/v1/recruitment/periods` — Tambah periode penerimaan baru (hanya dari Pendaftaran).
- `PUT /api/v1/recruitment/periods/:id` — Update periode & status aktif.
- `GET /api/v1/recruitment/applicants` — Daftar pendaftar (filter per periode, tahap, & divisi).
- `POST /api/v1/recruitment/apply` — Form submit pendaftaran pendaftar baru (Publik).
- `PATCH /api/v1/recruitment/applicants/:id/status` — Update status kelulusan / tahap pendaftar.
- `GET /api/v1/recruitment/check-status/:nim` — Cek status pengumuman penerimaan calon anggota.

### 4. Wawancara & Seleksi (`/api/v1/wawancara`)

- `GET /api/v1/wawancara/schedules` — Jadwal sesi wawancara pendaftar (tersinkronisasi dengan periode pendaftaran).
- `POST /api/v1/wawancara/score` — Input nilai dan catatan interviewer / pewawancara.
- `PATCH /api/v1/wawancara/schedules/:id` — Update jadwal dan pewawancara.

### 5. Absensi Kegiatan (`/api/v1/attendance`)

- `GET /api/v1/attendance/sessions` — Daftar sesi presensi kegiatan.
- `POST /api/v1/attendance/sessions` — Buat sesi absensi baru (dengan QR code generator).
- `POST /api/v1/attendance/check-in` — Submit presensi anggota (via scan QR atau manual).
- `GET /api/v1/attendance/recap/:sessionId` — Rekapitulasi kehadiran peserta per kegiatan.

### 6. Kegiatan Organisasi (`/api/v1/kegiatan`)

- `GET /api/v1/kegiatan` — Daftar kegiatan dan program kerja MDPTV.
- `POST /api/v1/kegiatan` — Tambah kegiatan baru.
- `PUT /api/v1/kegiatan/:id` — Update data kegiatan & dokumentasi.
- `DELETE /api/v1/kegiatan/:id` — Hapus kegiatan.

### 7. Keuangan & Kas (`/api/v1/kas`)

- `GET /api/v1/kas/transactions` — Daftar arus kas masuk (debit) & kas keluar (kredit).
- `POST /api/v1/kas/transactions` — Catat transaksi kas baru dengan bukti nota upload.
- `GET /api/v1/kas/summary` — Ringkasan total saldo, total pemasukan, dan pengeluaran.

### 8. Manajemen Anggota & Divisi (`/api/v1/members`, `/api/v1/divisions`)

- `GET /api/v1/members` — Direktori anggota aktif dan alumni per angkatan & divisi.
- `POST /api/v1/members` — Tambah anggota baru.
- `PUT /api/v1/members/:id` — Update profil dan status keaktifan anggota.
- `GET /api/v1/divisions` — Daftar divisi (tersinkronisasi dengan struktur CMS).

### 9. CMS & Konten Website (`/api/v1/cms`, `/api/v1/faqs`, `/api/v1/upload`)

- `GET /api/v1/cms/content` — Ambil konten landing page (Hero, Visi-Misi, Sejarah, Layout).
- `PUT /api/v1/cms/content` — Update konfigurasi konten dan tata letak bagian website.
- `GET /api/v1/faqs` / `POST /api/v1/faqs` — Tanya Jawab seputar MDPTV.
- `POST /api/v1/upload` — Upload media (PNG, JPG, PDF) langsung ke ImageKit CDN.

### 10. Dashboard Metrik (`/api/v1/dashboard`)

- `GET /api/v1/dashboard/metrics` — Metrik statistik ringkas untuk admin (total anggota, kas, pendaftar aktif, kegiatan berjalan).

---

## 🛡️ Keamanan & Standar Praktik

1. **Password Security**: Menggunakan native engine hashing `Bun.password` yang aman dari timing attack.
2. **CORS Whitelist**: Origin protektif untuk mencegah unauthorized web client access.
3. **Rate Limiting**: Melindungi API dari serangan brute force dan flood requests.
4. **Prisma Type Safety**: Bebas dari celah SQL Injection dengan parameter binding bawaan.

Mendaftarkan akun user baru dengan validasi domain bisnis.

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/users/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "mySecurePassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User berhasil didaftarkan.",
    "data": {
      "id": "a9a8f4c2-9e8c-4a3d-b4f1-0987654321ab",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "createdAt": "2026-05-18T03:20:10.123Z",
      "updatedAt": "2026-05-18T03:20:10.123Z"
    }
  }
  ```

### 3. Ambil Semua User

Mengambil daftar seluruh user terdaftar (Data disimpan in-memory, akan ter-reset saat server restart).

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/users`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Berhasil mengambil semua data user.",
    "data": [
      {
        "id": "a9a8f4c2-9e8c-4a3d-b4f1-0987654321ab",
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "createdAt": "2026-05-18T03:20:10.123Z",
        "updatedAt": "2026-05-18T03:20:10.123Z"
      }
    ]
  }
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
