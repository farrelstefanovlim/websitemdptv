"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import Container from "@/components/layout/Container";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import { getImageUrl } from "@/lib/image";

/* Visual styling per division (not editable, purely decorative) */
const divisionStyles = [
  {
    icon: "photo_camera",
    iconBg: "bg-secondary-fixed",
    iconColor: "border-secondary/10 text-secondary",
    dotColor: "bg-secondary",
    accentColor: "bg-secondary",
  },
  {
    icon: "palette",
    iconBg: "bg-tertiary-fixed",
    iconColor: "border-on-tertiary-fixed/10 text-on-tertiary-fixed",
    dotColor: "bg-tertiary",
    accentColor: "bg-tertiary",
  },
  {
    icon: "hub",
    iconBg: "bg-primary-fixed",
    iconColor: "border-on-primary-fixed/10 text-on-primary-fixed",
    dotColor: "bg-primary",
    accentColor: "bg-primary",
  },
  {
    icon: "badge",
    iconBg: "bg-amber-500/20",
    iconColor: "border-amber-500/20 text-amber-600",
    dotColor: "bg-amber-500",
    accentColor: "bg-amber-500",
  },
  {
    icon: "campaign",
    iconBg: "bg-cyan-500/20",
    iconColor: "border-cyan-500/20 text-cyan-600",
    dotColor: "bg-cyan-500",
    accentColor: "bg-cyan-500",
  },
];

export default function DivisionsSection() {
  const divs = useSectionContentStore((s) => s.divisions);
  const hydrated = useHydrated();
  const d = hydrated ? divs : DEFAULTS.divisions;

  // Merge editable content with visual styles
  const divisionsData = d.divisions.map((div, i) => ({
    ...(divisionStyles[i % divisionStyles.length] || divisionStyles[0]),
    image: div.image ? getImageUrl(div.image) : "",
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
