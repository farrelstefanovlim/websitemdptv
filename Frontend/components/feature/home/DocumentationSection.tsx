"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/layout/Container";
import AnimateOnScroll, {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/AnimateOnScroll";
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import { getImageUrl } from "@/lib/image";
import { useEffect } from "react";
import { useGalleryStore } from "@/stores/gallery.store";
/* Layout config — visual properties only, images come from the store */
const galleryLayout = [
  {
    span: "md:col-span-2 md:row-span-2",
    titleSize: "text-2xl sm:text-3xl",
    padding: "p-6 sm:p-10",
    hasAccent: true,
  },
  {
    span: "md:col-span-2",
    titleSize: "text-xl sm:text-2xl",
    padding: "p-5 sm:p-8",
    hasAccent: false,
  },
  {
    span: "",
    titleSize: "text-lg",
    padding: "p-5",
    hasAccent: false,
  },
  {
    span: "",
    titleSize: "text-lg",
    padding: "p-5",
    hasAccent: false,
  },
];

export default function DocumentationSection() {
  const doc = useSectionContentStore((s) => s.documentation);
  const hydrated = useHydrated();
  const d = hydrated ? doc : DEFAULTS.documentation;
  
  const { items: galleryItems, fetchGallery } = useGalleryStore();

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return (
    <section className="py-20 sm:py-28 md:py-[160px] relative" id="documentation">
      <Container className="relative">
        {/* Decorative label */}
        <div className="absolute top-0 right-0 p-4 border-l border-b border-outline-variant/20 text-[10px] font-bold text-primary/15 uppercase tracking-[0.5em] hidden lg:block">
          ARCHIVE-2024
        </div>

        {/* Header */}
        <AnimateOnScroll variant="fadeUp">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 md:mb-20 gap-6 sm:gap-8">
            <div className="max-w-xl">
              <Badge className="mb-4">{d.badgeText}</Badge>
              <SectionHeading
                label=""
                title={
                  <>
                    {d.headingBold}{" "}
                    <span className="font-extralight italic">{d.headingItalic}</span>
                  </>
                }
                description={d.description}
              />
            </div>
            <Link href="/galeri">
              <Button
                variant="outline"
                size="md"
                icon={
                  <Icon
                    name="arrow_forward"
                    className="group-hover:translate-x-2 transition-transform duration-300"
                  />
                }
                className="group w-full sm:w-auto"
              >
                {d.buttonText}
              </Button>
            </Link>
          </div>
        </AnimateOnScroll>

        {/* Bento Grid */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 h-auto md:h-[800px]"
          staggerDelay={0.12}
        >
          {galleryItems.filter((c) => c.featured && c.image).slice(0, 4).map((content, index) => {
            const layout = galleryLayout[index] || galleryLayout[galleryLayout.length - 1];
            return (
              <StaggerItem
                key={index}
                className={`
                  ${layout.span}
                  rounded-2xl sm:rounded-3xl overflow-hidden relative group
                  border border-outline-variant/15 hover:border-secondary/40 transition-all duration-500
                  ${index >= 2 ? "h-[250px] sm:h-[300px] md:h-auto" : "h-[300px] sm:h-auto"}
                `}
              >
                {content.image ? (
                  <img
                    className={`w-full h-full object-cover transition-all duration-700 ${index >= 2 ? "group-hover:scale-110" : "group-hover:scale-105"}`}
                    alt={content.title || `Gallery ${index + 1}`}
                    src={getImageUrl(content.image)}
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <Icon name="image" className="text-on-surface-variant/15 !text-6xl" />
                  </div>
                )}
                {/* Permanent subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Content overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end ${layout.padding} transition-opacity duration-500`}
                >
                  {content.label && (
                    <span className="text-[10px] text-label-bold uppercase tracking-[0.3em] text-white/50 mb-2">
                      {content.label}
                    </span>
                  )}
                  <h4 className={`font-display ${layout.titleSize} text-white font-bold leading-tight`}>
                    {content.title}
                  </h4>
                  {layout.hasAccent && (
                    <div className="w-10 h-0.5 bg-secondary mt-3 rounded-full" />
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </Container>
    </section>
  );
}
