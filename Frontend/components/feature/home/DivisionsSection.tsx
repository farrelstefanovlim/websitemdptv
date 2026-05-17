"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import Container from "@/components/layout/Container";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";

/* Visual styling per division (not editable, purely decorative) */
const divisionStyles = [
  {
    icon: "photo_camera",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiZlRZqqTnnWd0G44h6NFUk5MZGCEAqOaUbt9PCh8jFMcZ6KyYekvNTyqqayhnaZRLlYlLEzzYs_i83CH34eFfVqaaYFCtxJipqRHoqlDwmyKBxXLVzubaTNdsIUfMQ_Be7LXj4BfW2NsIh6DGyfOxdb5AzUrneAo_Zr0Rx-Jm2lASh-eCVARMh-RLvUwDK1W7XojLUXsSlrf_hcIp71PAbebvbtDmwr5ar5NATyPIGidnt88RIDuoaxygn89cxF8hqw7veqkl-LBN",
    iconBg: "bg-secondary-fixed",
    iconColor: "border-secondary/10 text-secondary",
    dotColor: "bg-secondary",
    accentColor: "bg-secondary",
  },
  {
    icon: "palette",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvAlHRGFnEg-9VzjA5IdT1TvIpNSpd9Y4yq7xzeIXwmdvi6Q437GAAz7SVCQ4Ry5I8IhfJ8dFw66Gx2zZneSMDFmpQy0Knlj9imau-ZzucMtjHC6r1dkEUSnpexdBO6Nvy1YQxeJbIm1Cc4GiLy4uCkJ3_TeRrPaYk3v1DzCHNInLiYTGqVm8PK94Zyh6RwJU0vDCGNlllGw-jo_UNloy8DTBjBK8pqb8rbAFzaexqiVwqUrWl84Pcik4pETRVWL4qDql-aSndO0HD",
    iconBg: "bg-tertiary-fixed",
    iconColor: "border-on-tertiary-fixed/10 text-on-tertiary-fixed",
    dotColor: "bg-tertiary",
    accentColor: "bg-tertiary",
  },
  {
    icon: "hub",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3YPirtyYQqUulGH_4ce37GHXSDyI5GIagMVsb7mGo-LhxxvOXh1HxHinJd0jdRWIDhrfWsKDuRsXsdOa91QHqsOjSLvyv2wU6gErgwTk4vKvRke7qmUDoiExVzhmqhJilOwWrhlo_vpgJQW76zI5qRjdppZg_O-nQm6gLvF0Z_SkQ0_5rX7zH-ZDN_x78ayUaBFcsnZnFyASb0IuGer9h-YMxwE2gp5elbv2yBQMSNC_QYDSf8jV5cQWWmopcpTCCLag8aTdBKwSy",
    iconBg: "bg-primary-fixed",
    iconColor: "border-on-primary-fixed/10 text-on-primary-fixed",
    dotColor: "bg-primary",
    accentColor: "bg-primary",
  },
];

export default function DivisionsSection() {
  const divs = useSectionContentStore((s) => s.divisions);
  const hydrated = useHydrated();
  const d = hydrated ? divs : DEFAULTS.divisions;

  // Merge editable content with visual styles
  const divisionsData = d.divisions.map((div, i) => ({
    ...divisionStyles[i],
    image: div.image || divisionStyles[i].image,
    number: String(i + 1).padStart(2, "0"),
    title: div.title,
    subtitle: div.subtitle,
    description: div.description,
    features: div.features,
  }));

  return (
    <section
      className="py-20 sm:py-28 md:py-[160px] relative overflow-hidden bg-surface-container-low"
      id="divisions"
    >
      <div className="absolute inset-0 grid-pattern opacity-15" />
      {/* Top gradient for smooth transition */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-[1]" />

      <Container className="relative z-[2]">
        {/* Header */}
        <AnimateOnScroll variant="fadeUp">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 md:mb-24 gap-6 sm:gap-8">
            <SectionHeading
              label={d.label}
              labelIcon="dot"
              title={
                <>
                  {d.headingBold} <span className="font-extralight italic">{d.headingItalic}</span>
                </>
              }
              description={d.description}
              className="max-w-2xl"
            />
            <div className="hidden md:block h-px flex-grow mx-12 bg-gradient-to-r from-outline-variant/30 to-transparent" />
            <div className="flex gap-2">
              {divisionsData.map((div) => (
                <div
                  key={div.number}
                  className="w-10 h-10 sm:w-12 sm:h-12 border border-outline-variant/25 rounded-xl flex items-center justify-center text-primary/25 text-sm font-medium"
                >
                  {div.number}
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Accordion */}
        <Accordion items={divisionsData} />
      </Container>

      {/* Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />
    </section>
  );
}
