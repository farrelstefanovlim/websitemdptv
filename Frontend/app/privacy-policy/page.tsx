import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface relative flex flex-col">
      <div className="fixed inset-0 noise-bg z-0 pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-15 pointer-events-none" />

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-[80px] h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <Icon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Kembali</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Icon name="settings_input_component" size="sm" />
            </div>
            <span className="text-xl font-black tracking-tighter font-display text-primary">MDPTV</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 pt-12 pb-24 px-4 sm:px-6 md:px-[80px]">
        <div className="max-w-[800px] mx-auto glass-card-light rounded-3xl p-8 sm:p-12 shadow-sm border border-outline-variant/30">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-secondary" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-secondary font-bold">
              Legal
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-8 tracking-tight font-display">
            Privacy Policy
          </h1>
          
          <div className="text-on-surface-variant leading-relaxed space-y-6">
            <p>
              Di UKM MDPTV Universitas Multi Data Palembang, privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan jenis informasi pribadi yang kami terima dan kumpulkan saat Anda menggunakan situs web kami, serta beberapa langkah yang kami ambil untuk melindungi informasi tersebut.
            </p>

            <h2 className="text-xl font-bold text-primary mt-8 mb-4">Pengumpulan dan Penggunaan Informasi</h2>
            <p>
              Kami hanya akan mengumpulkan informasi pribadi Anda saat pengisian formulir pendaftaran anggota atau komunikasi melalui detail kontak yang kami sediakan. Informasi yang dikumpulkan hanya akan digunakan untuk keperluan pendataan, seleksi administrasi, dan memberikan pemberitahuan seputar kegiatan MDPTV. MDPTV tidak akan menjual, menyewakan, atau membagikan daftar informasi anggota ke pihak ketiga.
            </p>

            <h2 className="text-xl font-bold text-primary mt-8 mb-4">Penggunaan Karya dan Galeri</h2>
            <p>
              Foto-foto dan dokumentasi yang dipublikasikan pada Galeri website ini adalah milik UKM MDPTV. Setiap dokumentasi yang mencakup wajah atau karya individu telah digunakan atas nama portofolio organisasi. Jika Anda merasa terdapat kekeliruan atau ingin dokumentasi Anda dihapus, silakan hubungi tim kami.
            </p>

            <h2 className="text-xl font-bold text-primary mt-8 mb-4">Perubahan Kebijakan</h2>
            <p>
              Kebijakan Privasi ini sewaktu-waktu dapat diubah dan diperbarui. Setiap perubahan kebijakan privasi akan dicantumkan pada halaman ini. Anda diharapkan untuk sesekali memeriksa halaman ini untuk menyadari adanya perubahan.
            </p>

            <p className="mt-8 text-sm italic text-on-surface-variant/70">
              Terakhir diperbarui: 27 Mei 2024
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
