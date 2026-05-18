# Bun + Express.js Backend Template (Domain-Driven Design)

Template backend minimalis namun berskala produksi, menggunakan **Bun**, **Express.js**, dan **TypeScript** dengan arsitektur **Domain-Driven Design (DDD)**. Template ini dirancang bersih, sangat modular, dan terstruktur agar siap dikembangkan untuk API skala menengah hingga besar.

---

## 🏛️ Struktur Arsitektur (DDD)

Arsitektur ini membagi sistem menjadi 4 layer utama untuk menjaga kode tetap modular, testable, dan tidak terikat ketat pada framework atau database:

```text
src/
├── domain/                  # 1. Domain Layer (Jantung Bisnis - Independen dari DB/Express)
│   ├── entities/            # Entity yang memiliki identitas unik (cth: User.ts)
│   ├── value-objects/       # Objek yang mendeskripsikan sesuatu & tidak memiliki ID, immutable (cth: Email.ts)
│   ├── repositories/        # Interface repositori (kontrak data) (cth: IUserRepository.ts)
│   └── exceptions/          # Error khusus domain bisnis (cth: DomainException.ts)
│
├── application/             # 2. Application Layer (Orkestrasi Alur Kasus Penggunaan)
│   ├── use-cases/           # Implementasi Use Case / User Story (cth: RegisterUserUseCase.ts)
│   ├── dtos/                # Data Transfer Object & Mapper respons (cth: UserDto.ts)
│   └── services/            # Interface helper aplikasi (cth: IHashService.ts)
│
├── infrastructure/          # 3. Infrastructure Layer (Implementasi Detail Teknis)
│   ├── database/            # Implementasi repository riil / Mock (cth: InMemoryUserRepository.ts)
│   ├── services/            # Implementasi concrete services (cth: BunHashService.ts)
│   └── config/              # Validasi Env & konfigurasi sistem (cth: env.ts)
│
└── presentation/            # 4. Presentation Layer (Komunikasi Luar / HTTP Interface)
    └── http/
        ├── controllers/     # Controller Express untuk handle HTTP request/response
        ├── routes/          # Routing Express & validasi schema request (cth: userRoutes.ts)
        ├── middlewares/     # Middleware Express (ErrorHandler, ValidationHandler)
        └── app.ts           # Bootstrapping Express, CORS, JSON parsing, & Routing
```

---

## ⚡ Fitur Utama

1. **Didukung oleh Bun**: Menggunakan runtime Javascript modern tercepat, eksekusi TypeScript instan tanpa build step di lokal.
2. **Express.js**: Framework router HTTP yang tangguh, populer, dan mudah digunakan.
3. **Type Safety dengan Zod**: Validasi skema request (Body, Query, Params) dan variabel lingkungan secara ketat dan otomatis.
4. **Keamanan Bawaan Bun**: Menggunakan API hashing password bawaan Bun (`Bun.password`) yang diimplementasikan secara native, sangat aman, dan super cepat tanpa dependency C/C++ external.
5. **Absolute Path Mapping**: Memungkinkan penulisan import yang bersih seperti `@domain/...` atau `@application/...` alih-alih `../../../../domain/...`.

---

## 🚀 Cara Memulai

### 1. Prasyarat
Pastikan Anda sudah menginstal **Bun** di komputer Anda. Jika belum, Anda bisa menginstalnya via PowerShell (Windows):
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Instalasi Dependency
Masuk ke folder `Backend` dan jalankan perintah install:
```bash
bun install
```

### 3. Konfigurasi Environment File
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi port jika diperlukan (default: `5000`).

### 4. Menjalankan Server

**Mode Pengembangan (dengan hot-reload otomatis):**
```bash
bun run dev
```

**Mode Produksi:**
```bash
bun start
```

---

## 📡 Dokumentasi API (Endpoints bawaan)

### 1. Health Check
Memeriksa status kesehatan server.
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Server is healthy",
    "timestamp": "2026-05-18T10:20:00.000Z",
    "bunVersion": "1.1.8"
  }
  ```

### 2. Registrasi User Baru
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
