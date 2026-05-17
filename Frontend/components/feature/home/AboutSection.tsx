"use client";

import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/layout/Container";
import AnimateOnScroll, {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/AnimateOnScroll";
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function AboutSection() {
  const about = useSectionContentStore((s) => s.about);
  const hydrated = useHydrated();
  const a = hydrated ? about : DEFAULTS.about;

  return (
    <section className="py-20 sm:py-28 md:py-[160px] relative" id="about">
      <Container className="relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-outline-variant/15 rounded-full -z-10 opacity-50 hidden md:block" />
        <div className="absolute bottom-40 left-10 text-[100px] md:text-[180px] font-black text-primary/[0.03] select-none leading-none -z-10 hidden sm:block">
          ABOUT
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-20 items-center">
          {/* Image Column */}
          <AnimateOnScroll
            variant="fadeRight"
            className="md:col-span-6 order-2 md:order-1 relative"
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-secondary/15 rounded-[32px] md:rounded-[48px] -z-10" />
              <div className="aspect-[4/5] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl relative z-10 bg-surface-container-highest">
                <img
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  alt="University students collaborating"
                  src={a.image || "https://i.pinimg.com/736x/75/57/f1/7557f1e58b18c5dcb21efd283e0bb48a.jpg"}
                />
                {/* Subtle permanent overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl z-20 card-elevated border border-outline-variant/20">
                <Icon name="movie" filled className="text-secondary text-4xl sm:text-5xl" />
                <div className="mt-2 text-[10px] text-label-bold text-primary/50 uppercase tracking-[0.2em]">
                  Media Production
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Text Column */}
          <div className="md:col-span-6 order-1 md:order-2">
            <AnimateOnScroll variant="fadeUp">
              <SectionHeading
                label={a.label}
                title={
                  <>
                    {a.headingLine1} <br />
                    <span className="font-extralight italic">{a.headingLine2}</span>
                  </>
                }
                className="mb-8 sm:mb-10"
              />
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" delay={0.2}>
              <p className="text-base sm:text-body-lg text-on-surface-variant mb-8 sm:mb-12 leading-relaxed">
                {a.description}
              </p>
            </AnimateOnScroll>

            <StaggerContainer className="grid gap-5 sm:gap-6" staggerDelay={0.15}>
              {a.features.map((feature) => (
                <StaggerItem key={feature.icon}>
                  <div className="flex items-start gap-4 sm:gap-5 group p-4 rounded-2xl hover:bg-surface-container-low transition-all duration-300">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl bg-secondary/8 border border-secondary/10 flex items-center justify-center group-hover:bg-secondary/15 group-hover:scale-105 transition-all duration-300">
                      <Icon name={feature.icon} filled className="text-secondary" />
                    </div>
                    <div>
                      <span className="text-body-md text-base sm:text-lg font-bold text-primary block mb-1">
                        {feature.title}
                      </span>
                      <span className="text-sm text-on-surface-variant/65 leading-relaxed">
                        {feature.description}
                      </span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </Container>
    </section>
  );
}
