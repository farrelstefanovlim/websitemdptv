"use client";

import { useMemo, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/feature/home/HeroSection";
import AboutSection from "@/components/feature/home/AboutSection";
import DivisionsSection from "@/components/feature/home/DivisionsSection";
import DocumentationSection from "@/components/feature/home/DocumentationSection";
import FaqSection from "@/components/feature/home/FaqSection";
import CtaSection from "@/components/feature/home/CtaSection";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  divisions: DivisionsSection,
  documentation: DocumentationSection,
  faq: FaqSection,
};

export default function Page() {
  const sections = useLayoutConfigStore((s) => s.sections);
  const fetchLayoutSections = useLayoutConfigStore((s) => s.fetchSections);
  const isLayoutLoading = useLayoutConfigStore((s) => s.isLoading);
  
  const fetchContentSections = useSectionContentStore((s) => s.fetchSections);
  const isContentLoading = useSectionContentStore((s) => s.isLoading);
  
  const hydrated = useHydrated();

  // Fetch data from backend API on mount
  useEffect(() => {
    fetchLayoutSections();
    fetchContentSections();
  }, [fetchLayoutSections, fetchContentSections]);

  const visibleSections = useMemo(
    () => sections.filter((s) => s.visible),
    [sections]
  );
  
  const isFetchingAPI = isLayoutLoading || isContentLoading || !hydrated;

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen flex flex-col relative">
      {/* Noise & Grid overlays */}
      <div className="fixed inset-0 noise-bg z-[100] pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-40 pointer-events-none" />

      {/* Loading Overlay / Splash Screen */}
      {isFetchingAPI && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="flex flex-col items-center gap-6">
            {/* Official MDPTV Logo */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 animate-pulse drop-shadow-[0_0_45px_rgba(255,255,255,0.2)]">
              <Image
                src="/logo-mdptv.png"
                alt="MDPTV Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Loading text */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-xs text-white/50 uppercase tracking-widest font-medium mt-2">
                Memuat Data API...
              </p>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main className="relative z-10">
        {!isFetchingAPI && (
          visibleSections.map((section) => {
            const Component = SECTION_COMPONENTS[section.id];
            if (!Component) return null;
            return <Component key={section.id} />;
          })
        )}
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}