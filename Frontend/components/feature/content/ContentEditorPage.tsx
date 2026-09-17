"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "@/stores/toast.store";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import type {
  HeroContent, AboutContent, DivisionsContent,
  DocumentationContent, FaqContent, CtaContent,
} from "@/stores/sectionContent.store";

type SectionKey = "hero" | "about" | "divisions" | "documentation" | "faq" | "footer";

const sectionMeta: { id: SectionKey; label: string; icon: string }[] = [
  { id: "hero", label: "Hero Section", icon: "rocket_launch" },
  { id: "about", label: "About Section", icon: "info" },
  { id: "divisions", label: "Divisions Section", icon: "diversity_3" },
  { id: "documentation", label: "Documentation Section", icon: "photo_library" },
  { id: "faq", label: "FAQ Section", icon: "help" },
  { id: "footer", label: "Footer Links", icon: "link" },
];

import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import DivisionsEditor from "./editors/DivisionsEditor";
import DocumentationEditor from "./editors/DocumentationEditor";
import FaqEditor from "./editors/FaqEditor";
import FooterEditor from "./editors/FooterEditor";

const EDITORS: Record<SectionKey, React.FC> = {
  hero: HeroEditor,
  about: AboutEditor,
  divisions: DivisionsEditor,
  documentation: DocumentationEditor,
  faq: FaqEditor,
  footer: FooterEditor,
};

/* ── Main Page ─────────────────────────────────────── */

export default function ContentEditorPage() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("hero");
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [resetSectionTarget, setResetSectionTarget] = useState<SectionKey | null>(null);
  const { resetSection, resetAll, fetchSections } = useSectionContentStore();
  const hydrated = useHydrated();
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");

  // Fetch data dari API saat mount
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
      <Button
        variant="none"
        size="none"
        onClick={() => setShowResetAllConfirm(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
      >
        <Icon name="restart_alt" size="sm" className="!text-xs" />
        <span className="hidden sm:inline">Reset All</span>
      </Button>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:brightness-110 shadow-sm shadow-secondary/20 transition-all shrink-0"
      >
        <Icon name="open_in_new" size="sm" className="!text-xs" />
        <span className="hidden sm:inline">Preview</span>
      </a>
    </div>
  );

  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Content Editor
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        Edit konten setiap section landing page
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(topbarActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(topbarTitle, mobileTitlePortalTarget)}

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-3">
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
                      <Button variant="none" size="none" onClick={(e) => { e.stopPropagation(); setResetSectionTarget(id); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-outline-variant/20 text-on-surface-variant/50 hover:bg-error/8 hover:text-error hover:border-error/25 transition-all cursor-pointer">
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

      {/* Reset Single Section Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(resetSectionTarget)}
        onClose={() => setResetSectionTarget(null)}
        onConfirm={async () => {
          if (resetSectionTarget) {
            resetSection(resetSectionTarget);
            toast.success(`Konten section "${resetSectionTarget}" berhasil di-reset ke nilai default.`);
            setResetSectionTarget(null);
          }
        }}
        title="Reset Konten Section"
        message={`Apakah Anda yakin ingin mengembalikan konten section "${resetSectionTarget}" ke teks default? Perubahan yang belum disimpan akan hilang.`}
        confirmText="Reset Section"
        variant="warning"
      />

      {/* Reset All Sections Confirm Modal */}
      <ConfirmModal
        isOpen={showResetAllConfirm}
        onClose={() => setShowResetAllConfirm(false)}
        onConfirm={async () => {
          resetAll();
          toast.success("Seluruh konten section berhasil di-reset ke nilai default.");
          setShowResetAllConfirm(false);
        }}
        title="Reset Seluruh Konten Landing Page"
        message="⚠️ PERINGATAN: Semua kustomisasi teks dan gambar pada semua section landing page akan dikembalikan ke pengaturan default."
        confirmText="Reset Semua Konten"
        variant="danger"
      />
    </>
  );
}
