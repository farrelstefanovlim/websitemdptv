"use client";

import SectionEditor from "@/components/feature/dashboard/SectionEditor";
import SectionPreview from "@/components/feature/dashboard/SectionPreview";
import Icon from "@/components/ui/Icon";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function Page() {
  const sections = useLayoutConfigStore((s) => s.sections);
  const visibleCount = sections.filter((s) => s.visible).length;
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">
              Layout Editor
            </h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50 hidden sm:block">
              Kelola tampilan dan urutan section landing page
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-medium text-on-surface-variant/60">
                {visibleCount}/{sections.length} sections visible
              </span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl bg-secondary text-on-secondary hover:brightness-110 transition-all duration-300"
            >
              <Icon name="open_in_new" size="sm" />
              <span className="hidden sm:inline">Preview</span>
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 sm:p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-8">
          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-3 sm:p-6">
              <SectionEditor />
            </div>
          </div>
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-3 sm:p-6 lg:sticky lg:top-24">
              <SectionPreview />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

