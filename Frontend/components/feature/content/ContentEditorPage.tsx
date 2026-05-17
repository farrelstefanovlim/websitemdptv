"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import type {
  HeroContent, AboutContent, DivisionsContent,
  DocumentationContent, FaqContent, CtaContent,
} from "@/stores/sectionContent.store";

type SectionKey = "hero" | "about" | "divisions" | "documentation" | "faq";

const sectionMeta: { id: SectionKey; label: string; icon: string }[] = [
  { id: "hero", label: "Hero Section", icon: "rocket_launch" },
  { id: "about", label: "About Section", icon: "info" },
  { id: "divisions", label: "Divisions Section", icon: "diversity_3" },
  { id: "documentation", label: "Documentation Section", icon: "photo_library" },
  { id: "faq", label: "FAQ Section", icon: "help" },
];

import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import DivisionsEditor from "./editors/DivisionsEditor";
import DocumentationEditor from "./editors/DocumentationEditor";
import FaqEditor from "./editors/FaqEditor";

const EDITORS: Record<SectionKey, React.FC> = {
  hero: HeroEditor,
  about: AboutEditor,
  divisions: DivisionsEditor,
  documentation: DocumentationEditor,
  faq: FaqEditor,
};

/* ── Main Page ─────────────────────────────────────── */

export default function ContentEditorPage() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("hero");
  const { resetSection, resetAll } = useSectionContentStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const mobileActions = (
    <>
      <Button variant="none" size="none" onClick={resetAll}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/25 text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all shrink-0">
        <Icon name="restart_alt" size="sm" />
      </Button>
      <a href="/" target="_blank" rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-on-secondary hover:brightness-110 transition-all shrink-0">
        <Icon name="open_in_new" size="sm" />
      </a>
    </>
  );

  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Content Editor
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        Edit konten setiap section
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(mobileActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      {/* Top Bar */}
      <header className="hidden lg:block sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">Content Editor</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Edit konten setiap section landing page</p>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="none" size="none" onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all duration-300">
              <Icon name="restart_alt" size="sm" /> Reset All
            </Button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl bg-secondary text-on-secondary hover:brightness-110 transition-all duration-300">
              <Icon name="open_in_new" size="sm" /> <span className="hidden sm:inline">Preview</span>
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 sm:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {sectionMeta.map(({ id, label, icon }) => {
            const isOpen = openSection === id;
            const Editor = EDITORS[id];
            return (
              <div key={id} className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen ? "border-secondary/20 shadow-lg" : "border-outline-variant/15"}`}>
                {/* Header */}
                <div role="button" tabIndex={0} onClick={() => setOpenSection(isOpen ? null : id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenSection(isOpen ? null : id); } }}
                  className="w-full flex items-center justify-between p-4 sm:p-5 bg-surface-container-lowest text-left cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-secondary/15 border border-secondary/20" : "bg-secondary/8 border border-secondary/10"}`}>
                      <Icon name={icon} filled className={`${isOpen ? "text-secondary" : "text-secondary/60"} !text-lg`} />
                    </div>
                    <div>
                      <span className={`text-sm sm:text-base font-semibold block ${isOpen ? "text-primary" : "text-primary/80"}`}>{label}</span>
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-medium">{id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOpen && (
                      <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); resetSection(id); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-outline-variant/20 text-on-surface-variant/50 hover:bg-error/8 hover:text-error hover:border-error/25 transition-all">
                        <Icon name="restart_alt" size="sm" className="!text-xs" /> Reset
                      </Button>
                    )}
                    <Icon name={isOpen ? "expand_less" : "expand_more"} size="sm" className="text-on-surface-variant/30" />
                  </div>
                </div>
                {/* Editor */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 bg-surface-container-low/50 border-t border-outline-variant/10">
                    <div className="pt-4">
                      <Editor />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
