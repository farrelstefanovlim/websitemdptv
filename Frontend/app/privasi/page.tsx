import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Kebijakan Privasi | MDPTV",
  description: "Cara UKM MDPTV mengumpulkan, memakai, dan melindungi data pendaftar.",
}

// Ganti dengan email yang boleh tampil publik, lalu sesuaikan isi dengan praktik sebenarnya.
const CONTACT_EMAIL = "mdptv@mhs.mdp.ac.id"
const LAST_UPDATED = "14 Oktober 2026"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-bold text-primary font-display">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-on-surface-variant">{children}</div>
    </section>
  )
}

export default function PrivasiPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <article className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-secondary hover:underline">
          Kembali ke beranda
        </Link>

        <h1 className="mt-6 text-3xl font-black text-primary font-display">Kebijakan Privasi</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Terakhir diperbarui: {LAST_UPDATED}</p>

        <Section title="Siapa kami">
          <p>
            Website ini dikelola oleh UKM MDPTV (Multi Data Palembang Television), Universitas Multi Data
            Palembang. Kebijakan ini menjelaskan data apa yang kami kumpulkan lewat formulir pendaftaran
            anggota dan bagaimana data itu dipakai.
          </p>
        </Section>

        <Section title="Data yang kami kumpulkan">
          <p>Saat kamu mengisi formulir pendaftaran, kami menerima:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>nama lengkap, NPM, email kampus, dan nomor WhatsApp;</li>
            <li>divisi yang kamu pilih dan motivasi bergabung;</li>
            <li>berkas CV atau foto diri, serta tautan portofolio (keduanya opsional).</li>
          </ul>
        </Section>

        <Section title="Untuk apa data dipakai">
          <p>
            Data dipakai untuk verifikasi dan seleksi anggota, menghubungi pendaftar, dan mengumumkan hasil
            seleksi. Pada pengumuman publik, hanya nama, divisi, dan NPM yang sebagian disamarkan yang
            ditampilkan.
          </p>
        </Section>

        <Section title="Penyimpanan berkas di Google Drive">
          <p>
            Berkas CV atau foto yang kamu unggah disimpan di folder Google Drive milik pengurus MDPTV.
            Aplikasi kami memakai izin Google Drive yang terbatas (drive.file), sehingga hanya bisa
            mengakses berkas yang dibuatnya sendiri. Aplikasi tidak membaca berkas lain di Drive tersebut,
            dan kamu tidak perlu login dengan akun Google untuk mendaftar.
          </p>
          <p>
            Penggunaan informasi yang diterima dari Google API mematuhi Kebijakan Data Pengguna Layanan
            Google API, termasuk persyaratan Penggunaan Terbatas.
          </p>
        </Section>

        <Section title="Siapa yang bisa melihat datamu">
          <p>
            Data hanya dapat dilihat oleh pengurus MDPTV yang berwenang melalui halaman admin. Kami tidak
            menjual atau membagikan datamu kepada pihak ketiga untuk keperluan komersial.
          </p>
        </Section>

        <Section title="Penyimpanan dan penghapusan">
          <p>
            Data disimpan selama proses seleksi dan selama dibutuhkan untuk administrasi keanggotaan. Kamu
            bisa meminta data dan berkasmu dihapus kapan saja lewat kontak di bawah.
          </p>
        </Section>

        <Section title="Kontak">
          <p>
            Pertanyaan atau permintaan penghapusan data bisa dikirim ke{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-secondary hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="Perubahan kebijakan">
          <p>
            Jika kebijakan ini berubah, versi terbaru akan dipublikasikan di halaman ini beserta tanggal
            pembaruannya.
          </p>
        </Section>
      </article>
    </main>
  )
}
