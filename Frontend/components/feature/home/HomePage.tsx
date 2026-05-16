"use client";

import { useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/feature/home/HeroSection";
import AboutSection from "@/components/feature/home/AboutSection";
import DivisionsSection from "@/components/feature/home/DivisionsSection";
import DocumentationSection from "@/components/feature/home/DocumentationSection";
import FaqSection from "@/components/feature/home/FaqSection";
import CtaSection from "@/components/feature/home/CtaSection";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";
import { useHydrated } from "@/hooks/useHydrated";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  divisions: DivisionsSection,
  documentation: DocumentationSection,
  faq: FaqSection,
  cta: CtaSection,
};

export default function HomePage() {
  const sections = useLayoutConfigStore((s) => s.sections);
  const hydrated = useHydrated();

  const visibleSections = useMemo(
    () => sections.filter((s) => s.visible),
    [sections]
  );

  return (
    <>
      {/* Noise & Grid overlays */}
      <div className="fixed inset-0 noise-bg z-[100]" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-40" />

      <Navbar />

      <main className="relative z-10">
        {hydrated ? (
          visibleSections.map((section) => {
            const Component = SECTION_COMPONENTS[section.id];
            if (!Component) return null;
            return <Component key={section.id} />;
          })
        ) : (
          /* Render all sections in default order during SSR */
          Object.entries(SECTION_COMPONENTS).map(([id, Component]) => (
            <Component key={id} />
          ))
        )}
      </main>

      <Footer />
    </>
  );
}
