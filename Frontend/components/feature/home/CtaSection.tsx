"use client";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function CtaSection() {
  const ctaStore = useSectionContentStore((s) => s.cta);
  const registrationOpen = useRecruitmentStore((s) => s.registrationOpen);
  const hydrated = useHydrated();
  const router = useRouter();
  const c = hydrated ? ctaStore : DEFAULTS.cta;

  if (hydrated && !registrationOpen) return null;

  return (
    <section className="py-20 sm:py-28 md:py-[160px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative" id="cta">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

      <AnimateOnScroll variant="scaleUp" duration={0.8}>
        <div className="max-w-[1440px] mx-auto bg-black text-white rounded-3xl sm:rounded-[48px] md:rounded-[64px] p-8 sm:p-12 md:p-24 lg:p-32 relative overflow-hidden text-center border border-white/5">
          <div className="absolute inset-0 noise-bg opacity-10" />
          <div className="absolute inset-0 grid-pattern opacity-8" />

          {/* Glow effects with pulse */}
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-secondary/25 blur-[120px] sm:blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2 pulse-glow" />
          <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-tertiary-fixed/15 blur-[100px] sm:blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pulse-glow" style={{ animationDelay: "2s" }} />

          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <AnimateOnScroll variant="fadeIn" delay={0.2}>
              <div className="inline-flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <span className="w-6 sm:w-8 h-px bg-secondary" />
                <span className="text-label-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-secondary">
                  {c.label}
                </span>
                <span className="w-6 sm:w-8 h-px bg-secondary" />
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" delay={0.4}>
              <h2 className="text-2xl sm:text-headline-lg-mobile md:text-display mb-8 sm:mb-10 leading-[0.9] tracking-tight">
                {c.headingLine1} <br />
                <span className="font-extralight italic opacity-80">
                  {c.headingLine2}
                </span>
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" delay={0.6}>
              <p className="text-sm sm:text-body-lg text-white/45 mb-10 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
                {c.description}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => router.push("/daftar")}>
                  {c.buttonPrimary}
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
