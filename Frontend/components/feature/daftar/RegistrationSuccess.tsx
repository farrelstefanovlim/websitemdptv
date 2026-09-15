"use client";

import { useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Alert from "@/components/ui/Alert";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useRecruitmentStore } from "@/stores/recruitment.store";

export default function RegistrationSuccess() {
  const { groupLink, fetchGroupLink } = useRecruitmentStore();

  useEffect(() => {
    fetchGroupLink();
  }, [fetchGroupLink]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 noise-bg z-[1]" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-30" />
      <AnimateOnScroll variant="scaleUp" className="relative z-10">
        <div className="bg-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 max-w-md w-full text-center border border-outline-variant/15 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <Icon name="check_circle" filled className="text-green-500 !text-5xl" />
          </div>
          <h2 className="text-2xl font-black text-primary mb-3">Pendaftaran Berhasil!</h2>
          <p className="text-sm text-on-surface-variant/60 mb-8 leading-relaxed">
            Terima kasih telah mendaftar di MDPTV. Tim kami akan menghubungi kamu melalui email untuk proses selanjutnya.
          </p>
          <Alert variant="info" title="Status: Pending Review" className="text-left mb-8">
            <span className="text-[10px] text-on-surface-variant/70">Penutupan Pendaftaran 2 Oktober 2026</span>
          </Alert>

          {groupLink && (
            <div className="mb-8">
              <a href={groupLink} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-green-500 text-white text-sm font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Icon name="groups" size="sm" /> Bergabung Grup WhatsApp
              </a>
            </div>
          )}
          <a href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-white text-sm font-bold hover:brightness-110 transition-all">
            <Icon name="arrow_back" size="sm" /> Kembali ke Beranda
          </a>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
