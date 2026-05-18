# MDPTV Scroll Down Website 🚀

Repositori ini berisi kode sumber lengkap untuk proyek **MDPTV Scroll Down Website** yang terbagi menjadi dua bagian utama: **Frontend** (berbasis Next.js) dan **Backend** (berbasis Bun + Express.js dengan arsitektur Domain-Driven Design).

---

## 🏛️ Gambaran Umum Arsitektur

Proyek ini dibangun menggunakan struktur modular yang memisahkan urusan visual (tampilan) dan logika bisnis utama (data & API):

*   **`/frontend`**: Aplikasi client-side interaktif modern berbasis **Next.js 16** dengan performa rendering super cepat menggunakan compiler **Turbopack**.
*   **`/Backend`**: Server RESTful API berperforma tinggi yang didukung oleh **Bun** (runtime JS modern) dan **Express.js** menggunakan pola arsitektur **Domain-Driven Design (DDD)** yang bersih, modular, dan siap diskalakan.

---

## 📚 Library & Teknologi yang Digunakan

### 🖥️ Frontend (Next.js)
Tampilan web dibuat interaktif, estetis, dan responsif dengan library berikut:
*   **Next.js (v16.2.6)** & **React (v19)**: Framework React modern dengan performa tinggi.
*   **Turbopack**: Compiler Next.js berbasis Rust yang mempercepat hot-reloading di lokal hingga di bawah 1 detik.
*   **Framer Motion (v12.38.0)**: Library animasi modern untuk menghadirkan mikro-interaksi dan animasi scroll down yang premium.
*   **Zustand (v5.0.13)**: Manajemen state global yang sangat ringan dan cepat.
*   **Tailwind CSS (v4)**: Framework CSS utilitas terbaru untuk styling antarmuka modern yang cepat.
*   **xlsx**: Library untuk mengekspor data tabel frontend langsung ke dokumen Excel.

### 🗄️ Backend (Bun + Express.js DDD)
Server API tangguh dengan performa tinggi, type-safety, dan arsitektur kokoh:
*   **Express.js (v4.22.2)**: Framework minimalis dan andal untuk perutean HTTP API.
*   **Zod (v3.25.76)**: Pustaka validasi skema data runtime dan tipe data TypeScript untuk request payload dan environment variables.
*   **Bun Password Hashing (Native)**: Keamanan hashing bawaan runtime Bun (`Bun.password`) yang diimplementasikan secara native di level mesin untuk enkripsi sangat cepat dan aman tanpa dependensi eksternal.
*   **Cors & Dotenv**: Integrasi keamanan lintas domain (CORS) dan pembaca variabel lingkungan `.env`.
*   **TypeScript (v5.9.3)** & **Path Mapping Aliases**: Konfigurasi path khusus (`@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`) agar kode import terbebas dari path relatif `../../../../`.

---

## 📂 Struktur Repositori

```text
/ (Root Workspace)
├── frontend/                # Aplikasi Next.js (Visual & State Management)
│   ├── app/                 # Next.js App Router (Halaman & Layout)
│   ├── components/          # Komponen UI Reusable (Accordion, Navbar, Faq, dll)
│   ├── hooks/               # Custom React Hooks
│   ├── lib/                 # Utilitas frontend & client API
│   ├── public/              # File aset statis (gambar, ikon, logo)
│   └── stores/              # State management global (Zustand)
│
└── Backend/                 # Aplikasi API Express + Bun (DDD Architecture)
    ├── src/
    │   ├── domain/          # Bisnis logika murni (Entities, Value Objects, Kontrak Repo)
    │   ├── application/     # Kasus Penggunaan (Use Cases) & Data Transfer Objects (DTO)
    │   ├── infrastructure/  # Detail teknis (Validasi Env, Hash concrete, InMemory DB)
    │   └── presentation/    # HTTP Interface (Controllers, Routes, Error Middlewares)
    └── README.md            # Panduan teknis khusus Backend
```

---

## 🚀 Cara Menjalankan Proyek di Lokal

Pastikan Anda sudah menginstal **Bun** di komputer Anda. Bun digunakan sebagai runtime utama di backend dan package manager di frontend demi kecepatan maksimal.

### 1. Jalankan Backend (API Server)
Buka terminal baru di folder proyek utama Anda, lalu jalankan perintah berikut:

```bash
# 1. Masuk ke direktori Backend
cd Backend

# 2. Salin file konfigurasi env lokal
cp .env.example .env

# 3. Jalankan server backend (Mode development dengan watch mode)
bun run dev
```
*Server Backend akan aktif di: `http://localhost:5000` (Verifikasi di: `http://localhost:5000/api/health`)*

---

### 2. Jalankan Frontend (Web Client)
Buka terminal baru yang berbeda, lalu jalankan perintah berikut:

```bash
# 1. Masuk ke direktori frontend
cd frontend

# 2. Jalankan aplikasi frontend Next.js (dengan Turbopack)
bun run dev
```
*Aplikasi Frontend Anda akan aktif di: `http://localhost:3000`*

---

## 📡 Endpoint API Utama yang Tersedia (Bawaan)

Untuk mempermudah pengujian awal Anda, backend telah dilengkapi dengan beberapa endpoint default:

*   **`GET /api/health`** — Memeriksa status kesehatan server backend dan versi Bun.
*   **`POST /api/users/register`** — Mendaftarkan akun user baru (melakukan validasi email menggunakan *Value Object* domain dan melakukan hashing aman).
*   **`GET /api/users`** — Mengambil seluruh daftar data user yang terdaftar di database in-memory.
