"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

export default function RegistrationClosed() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 noise-bg z-[1] pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-30 pointer-events-none" />

      <AnimateOnScroll variant="scaleUp" className="relative z-10 w-full max-w-lg">
        <div className="bg-surface-container-lowest rounded-3xl sm:rounded-[40px] p-6 sm:p-10 text-center border border-outline-variant/15 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Icon name="lock" filled className="text-amber-500 !text-5xl" />
          </div>

          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-700 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block mb-2">
            Periode Pendaftaran Berakhir
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-primary font-display mb-3">
            Pendaftaran Sedang Ditutup
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant/70 mb-8 leading-relaxed">
            Periode pendaftaran anggota baru MDPTV saat ini belum dibuka atau telah berakhir. Kamu dapat memantau hasil pengumuman atau mengikuti media sosial resmi kami untuk jadwal pembukaan gelombang berikutnya.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/pengumuman"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-secondary text-white text-xs font-bold hover:brightness-110 shadow-sm shadow-secondary/20 transition-all"
            >
              <Icon name="campaign" size="sm" />
              <span>Cek Pengumuman</span>
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-surface-container-low text-primary text-xs font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-all"
            >
              <Icon name="home" size="sm" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
