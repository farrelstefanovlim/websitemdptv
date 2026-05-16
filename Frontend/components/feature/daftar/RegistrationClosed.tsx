"use client";

import Icon from "@/components/ui/Icon";
import Alert from "@/components/ui/Alert";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

export default function RegistrationClosed() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 noise-bg z-[1]" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-30" />
      <AnimateOnScroll variant="scaleUp" className="relative z-10">
        <div className="bg-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 max-w-md w-full text-center border border-outline-variant/15 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Icon name="lock" filled className="text-red-400 !text-5xl" />
          </div>
          <h2 className="text-2xl font-black text-primary mb-3">Pendaftaran Ditutup</h2>
          <Alert variant="warning" className="mb-8 text-left">
            Maaf, pendaftaran anggota MDPTV sedang tidak dibuka saat ini. Silakan cek kembali nanti atau follow media sosial kami untuk info pembukaan tahap berikutnya.
          </Alert>
          <a href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all">
            <Icon name="arrow_back" size="sm" /> Kembali ke Beranda
          </a>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
