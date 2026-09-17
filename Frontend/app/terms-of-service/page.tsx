import Link from "next/link"
import Image from "next/image"
import Icon from "@/components/ui/Icon"
import Footer from "@/components/layout/Footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-on-surface relative flex flex-col">
      <div className="fixed inset-0 noise-bg z-0 pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-15 pointer-events-none" />

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group">
            <Icon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Kembali</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <Image src="/logo-mdptv.png" alt="MDPTV Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-black tracking-tighter font-display text-primary">MDPTV</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 pt-12 pb-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[800px] mx-auto glass-card-light rounded-3xl p-8 sm:p-12 shadow-sm border border-outline-variant/30">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-secondary" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-secondary font-bold">Legal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-8 tracking-tight font-display">Terms of Service</h1>

          <div className="text-on-surface-variant leading-relaxed space-y-6">
            <p>Selamat datang di website resmi UKM MDPTV Universitas Multi Data Palembang. Dengan mengakses atau menggunakan aplikasi / layanan situs web ini, Anda setuju untuk terikat oleh Ketentuan Layanan (Terms of Service) ini. Jika Anda tidak setuju dengan ketentuan ini, sebaiknya Anda tidak menggunakan layanan website kami.</p>

            <h2 className="text-xl font-bold text-primary mt-8 mb-4">Penggunaan Layanan</h2>
            <p>Website ini digunakan sebagai profil pilar informasi, dokumentasi portofolio organisasi, dan sarana pendaftaran bagi calon anggota MDPTV (Mahasiswa/i aktif Universitas Multi Data Palembang). Anda dilarang untuk:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Mendownload, mendistribusikan, dan memodifikasi portofolio foto tanpa pengakuan (kredit) yang jelas dari UKM MDPTV.</li>
              <li>Penyalahgunaan celah sistem dalam form pendaftaran dan aktivitas spamming apa pun.</li>
              <li>Menggunakan platform untuk menyebarkan kebencian, suku, ras, agama (SARA), dan materi ilegal.</li>
            </ul>

            <h2 className="text-xl font-bold text-primary mt-8 mb-4">Hak Kekayaan Intelektual</h2>
            <p>Seluruh karya, video, foto, desain grafis, dan material media lainnya yang ditayangkan di website ini adalah Hak Kekayaan Intelektual mutlak dari UKM MDPTV dan kreator mahasiswa terkait. Penggunaan komersial dari karya-karya di dalam website memerlukan lisensi tertulis dari pihak administrator kami.</p>

            <h2 className="text-xl font-bold text-primary mt-8 mb-4">Gagasan Penolakan</h2>
            <p>Layanan kami sediakan dengan dasar "sebagaimana adanya". Artinya MDPTV tidak menjadikan jaminan bahwa web ini akan terus terbebas 100% dari kesalahan, error layanan API, dll.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
