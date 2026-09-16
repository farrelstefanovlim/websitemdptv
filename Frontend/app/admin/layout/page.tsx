"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import SectionEditor from "@/components/feature/layoutEditor/SectionEditor";
import SectionPreview from "@/components/feature/layoutEditor/SectionPreview";
import Icon from "@/components/ui/Icon";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function Page() {
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const topbarTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const sections = useLayoutConfigStore((s) => s.sections);
  const fetchSections = useLayoutConfigStore((s) => s.fetchSections);
  const visibleCount = sections.filter((s) => s.visible).length;

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const topbarActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-xl border border-outline-variant/10 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
        <span className="text-[11px] font-semibold text-on-surface-variant/70">
          {visibleCount}/{sections.length} Section Aktif
        </span>
      </div>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:brightness-110 transition-all shrink-0 shadow-sm shadow-secondary/20"
      >
        <Icon name="open_in_new" size="sm" className="!text-xs" />
        <span className="hidden sm:inline">Preview</span>
      </a>
    </div>
  );

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Layout Editor
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        Kelola tampilan dan urutan section landing page
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(topbarActions, portalTarget)}
      {hydrated && topbarTitlePortalTarget && createPortal(topbarTitle, topbarTitlePortalTarget)}

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-4 sm:p-6">
              <SectionEditor />
            </div>
          </div>
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-4 sm:p-6 lg:sticky lg:top-24">
              <SectionPreview />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
