"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useRecruitmentStore } from "@/stores/recruitment.store";

export default function RegistrationSuccess() {
  const { groupLink, fetchGroupLink, setHasRegistered } = useRecruitmentStore();

  useEffect(() => {
    fetchGroupLink();
  }, [fetchGroupLink]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 noise-bg z-[1] pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-30 pointer-events-none" />

      <AnimateOnScroll variant="scaleUp" className="relative z-10 w-full max-w-lg">
        <div className="bg-surface-container-lowest rounded-3xl sm:rounded-[40px] p-6 sm:p-10 text-center border border-outline-variant/15 shadow-2xl">
          {/* Success Icon Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Icon name="check_circle" filled className="text-emerald-500 !text-5xl" />
          </div>

          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-2">
            Berkas Diterima Sistem
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-primary font-display mb-2">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant/70 mb-6 leading-relaxed">
            Terima kasih telah mendaftar sebagai calon anggota UKM MDPTV. Data dan motivasimu telah berhasil masuk ke sistem seleksi kami.
          </p>

          {/* WhatsApp Group CTA Card */}
          {groupLink && (
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/70 text-left mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                  <Icon name="groups" filled size="md" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Grup Komunikasi Calon Anggota
                  </h3>
                  <p className="text-[10px] text-emerald-700/80">
                    Wajib bergabung untuk update jadwal seleksi & wawancara
                  </p>
                </div>
              </div>

              <a
                href={groupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-700 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Icon name="chat" size="sm" />
                <span>Gabung Grup WhatsApp Resmi</span>
              </a>
            </div>
          )}

          {/* Recruitment Stages Timeline */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-left mb-6">
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-3">
              Tahapan Selanjutnya
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-on-surface-variant/80">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span className="font-semibold text-primary">Verifikasi & Tinjau Berkas</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface-variant/80">
                <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Wawancara & Portofolio Singkat</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface-variant/80">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant/40 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Pengumuman Hasil Kelulusan</span>
              </div>
            </div>
          </div>

          {/* Edit / Retry Form Trigger */}
          <button
            type="button"
            onClick={() => setHasRegistered(false)}
            className="block w-full text-center text-xs text-on-surface-variant/60 underline mb-4 hover:text-primary transition-colors cursor-pointer"
          >
            Salah isi data? Klik di sini untuk mengisi ulang formulir
          </button>

          {/* Action Links */}
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
