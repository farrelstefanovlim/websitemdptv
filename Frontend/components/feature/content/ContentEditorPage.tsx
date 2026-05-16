"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";
import type {
  HeroContent, AboutContent, DivisionsContent,
  DocumentationContent, FaqContent, CtaContent,
} from "@/stores/sectionContent.store";

type SectionKey = "hero" | "about" | "divisions" | "documentation" | "faq" | "cta";

const sectionMeta: { id: SectionKey; label: string; icon: string }[] = [
  { id: "hero", label: "Hero Section", icon: "rocket_launch" },
  { id: "about", label: "About Section", icon: "info" },
  { id: "divisions", label: "Divisions Section", icon: "diversity_3" },
  { id: "documentation", label: "Documentation Section", icon: "photo_library" },
  { id: "faq", label: "FAQ Section", icon: "help" },
  { id: "cta", label: "Call to Action", icon: "campaign" },
];

/* ── Reusable field components ─────────────────────── */

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const base = "w-full px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${base} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </div>
  );
}

/* ── Per-section editors ───────────────────────────── */

function HeroEditor() {
  const { hero, updateHero } = useSectionContentStore();
  const h = hero;
  return (
    <div className="grid gap-3">
      <Field label="Badge Text" value={h.badgeText} onChange={(v) => updateHero({ badgeText: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title Line 1" value={h.titleLine1} onChange={(v) => updateHero({ titleLine1: v })} />
        <Field label="Title Line 2 (italic)" value={h.titleLine2} onChange={(v) => updateHero({ titleLine2: v })} />
      </div>
      <Field label="Description" value={h.description} onChange={(v) => updateHero({ description: v })} textarea />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Primary Button" value={h.buttonPrimary} onChange={(v) => updateHero({ buttonPrimary: v })} />
        <Field label="Secondary Button" value={h.buttonSecondary} onChange={(v) => updateHero({ buttonSecondary: v })} />
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-2">Stats</span>
        <div className="grid gap-2">
          {h.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input type="text" value={stat.value} onChange={(e) => { const s = [...h.stats]; s[i] = { ...s[i], value: e.target.value }; updateHero({ stats: s }); }}
                className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all"
                placeholder="Value" />
              <input type="text" value={stat.label} onChange={(e) => { const s = [...h.stats]; s[i] = { ...s[i], label: e.target.value }; updateHero({ stats: s }); }}
                className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all"
                placeholder="Label" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutEditor() {
  const { about, updateAbout } = useSectionContentStore();
  return (
    <div className="grid gap-3">
      <Field label="Section Label" value={about.label} onChange={(v) => updateAbout({ label: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading Line 1" value={about.headingLine1} onChange={(v) => updateAbout({ headingLine1: v })} />
        <Field label="Heading Line 2 (italic)" value={about.headingLine2} onChange={(v) => updateAbout({ headingLine2: v })} />
      </div>
      <Field label="Description" value={about.description} onChange={(v) => updateAbout({ description: v })} textarea />
      <div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-2">Features</span>
        <div className="grid gap-3">
          {about.features.map((f, i) => (
            <div key={i} className="p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={f.icon} onChange={(e) => { const fs = [...about.features]; fs[i] = { ...fs[i], icon: e.target.value }; updateAbout({ features: fs }); }}
                  className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Icon name" />
                <input type="text" value={f.title} onChange={(e) => { const fs = [...about.features]; fs[i] = { ...fs[i], title: e.target.value }; updateAbout({ features: fs }); }}
                  className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Title" />
              </div>
              <input type="text" value={f.description} onChange={(e) => { const fs = [...about.features]; fs[i] = { ...fs[i], description: e.target.value }; updateAbout({ features: fs }); }}
                className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Description" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DivisionsEditor() {
  const { divisions, updateDivisions } = useSectionContentStore();
  return (
    <div className="grid gap-3">
      <Field label="Section Label" value={divisions.label} onChange={(v) => updateDivisions({ label: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading Bold" value={divisions.headingBold} onChange={(v) => updateDivisions({ headingBold: v })} />
        <Field label="Heading Italic" value={divisions.headingItalic} onChange={(v) => updateDivisions({ headingItalic: v })} />
      </div>
      <Field label="Description" value={divisions.description} onChange={(v) => updateDivisions({ description: v })} />
      {divisions.divisions.map((div, i) => (
        <div key={i} className="p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 grid gap-2">
          <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">Divisi {i + 1}</span>
          <div className="grid sm:grid-cols-2 gap-2">
            <input type="text" value={div.title} onChange={(e) => { const d = [...divisions.divisions]; d[i] = { ...d[i], title: e.target.value }; updateDivisions({ divisions: d }); }}
              className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Title" />
            <input type="text" value={div.subtitle} onChange={(e) => { const d = [...divisions.divisions]; d[i] = { ...d[i], subtitle: e.target.value }; updateDivisions({ divisions: d }); }}
              className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Subtitle" />
          </div>
          <textarea value={div.description} onChange={(e) => { const d = [...divisions.divisions]; d[i] = { ...d[i], description: e.target.value }; updateDivisions({ divisions: d }); }}
            rows={2} className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all resize-none" placeholder="Description" />
          <div className="grid grid-cols-3 gap-2">
            {div.features.map((feat, fi) => (
              <input key={fi} type="text" value={feat} onChange={(e) => { const d = [...divisions.divisions]; const feats = [...d[i].features]; feats[fi] = e.target.value; d[i] = { ...d[i], features: feats }; updateDivisions({ divisions: d }); }}
                className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary/40 transition-all" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentationEditor() {
  const { documentation, updateDocumentation, toggleFeatured } = useSectionContentStore();
  const allItems = documentation.galleryItems;
  const featuredCount = allItems.filter((i) => i.featured).length;
  const withImages = allItems.filter((i) => i.image);

  return (
    <div className="grid gap-3">
      <Field label="Badge Text" value={documentation.badgeText} onChange={(v) => updateDocumentation({ badgeText: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading Bold" value={documentation.headingBold} onChange={(v) => updateDocumentation({ headingBold: v })} />
        <Field label="Heading Italic" value={documentation.headingItalic} onChange={(v) => updateDocumentation({ headingItalic: v })} />
      </div>
      <Field label="Description" value={documentation.description} onChange={(v) => updateDocumentation({ description: v })} textarea />
      <Field label="Button Text" value={documentation.buttonText} onChange={(v) => updateDocumentation({ buttonText: v })} />

      {/* Featured Photo Picker */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block">
              Foto di Landing Page
            </span>
            <span className="text-[9px] text-on-surface-variant/30 mt-0.5 block">
              Klik foto untuk tampilkan/sembunyikan di landing page
            </span>
          </div>
          <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-lg">
            {featuredCount} dipilih
          </span>
        </div>

        {withImages.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-outline-variant/20">
            <Icon name="photo_library" className="text-on-surface-variant/15 !text-4xl mx-auto mb-2" />
            <p className="text-xs text-on-surface-variant/30">Belum ada foto di galeri</p>
            <a href="/admin/galeri" className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-2 inline-block hover:underline">
              Upload Foto →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allItems.map((item, i) => {
              if (!item.image) return null;
              return (
                <button
                  key={i}
                  onClick={() => toggleFeatured(i)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group
                    ${item.featured
                      ? "border-secondary ring-2 ring-secondary/20 shadow-md"
                      : "border-outline-variant/15 opacity-50 hover:opacity-80 hover:border-outline-variant/30"
                    }`}
                >
                  <img src={item.image} alt={item.title || `Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {/* Selected overlay */}
                  {item.featured && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                      <Icon name="check" size="sm" className="text-white !text-xs" />
                    </div>
                  )}
                  {/* Label on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[8px] text-white font-bold leading-tight truncate">{item.title || item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Link to gallery admin */}
        <a
          href="/admin/galeri"
          className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 hover:border-secondary/30 hover:bg-secondary/5 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="add_photo_alternate" size="sm" className="text-secondary" />
            <span className="text-xs font-medium text-on-surface-variant/60">Kelola semua foto di Galeri</span>
          </div>
          <Icon name="arrow_forward" size="sm" className="text-on-surface-variant/20 group-hover:text-secondary group-hover:translate-x-1 transition-all !text-sm" />
        </a>
      </div>
    </div>
  );
}

function FaqEditor() {
  const { faq, updateFaq } = useSectionContentStore();
  const addItem = () => updateFaq({ items: [...faq.items, { question: "", answer: "" }] });
  const removeItem = (i: number) => updateFaq({ items: faq.items.filter((_, idx) => idx !== i) });
  return (
    <div className="grid gap-3">
      <Field label="Section Label" value={faq.label} onChange={(v) => updateFaq({ label: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading Bold" value={faq.headingBold} onChange={(v) => updateFaq({ headingBold: v })} />
        <Field label="Heading Italic" value={faq.headingItalic} onChange={(v) => updateFaq({ headingItalic: v })} />
      </div>
      <Field label="Description" value={faq.description} onChange={(v) => updateFaq({ description: v })} textarea />
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40">FAQ Items ({faq.items.length})</span>
          <button onClick={addItem} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-all">
            <Icon name="add" size="sm" className="!text-xs" /> Tambah
          </button>
        </div>
        <div className="grid gap-2">
          {faq.items.map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">FAQ #{i + 1}</span>
                <button onClick={() => removeItem(i)} className="text-error/60 hover:text-error transition-colors">
                  <Icon name="delete" size="sm" className="!text-sm" />
                </button>
              </div>
              <input type="text" value={item.question} onChange={(e) => { const items = [...faq.items]; items[i] = { ...items[i], question: e.target.value }; updateFaq({ items }); }}
                className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary font-medium focus:outline-none focus:border-secondary/40 transition-all" placeholder="Question" />
              <textarea value={item.answer} onChange={(e) => { const items = [...faq.items]; items[i] = { ...items[i], answer: e.target.value }; updateFaq({ items }); }}
                rows={2} className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all resize-none" placeholder="Answer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtaEditor() {
  const { cta, updateCta } = useSectionContentStore();
  return (
    <div className="grid gap-3">
      <Field label="Label" value={cta.label} onChange={(v) => updateCta({ label: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading Line 1" value={cta.headingLine1} onChange={(v) => updateCta({ headingLine1: v })} />
        <Field label="Heading Line 2 (italic)" value={cta.headingLine2} onChange={(v) => updateCta({ headingLine2: v })} />
      </div>
      <Field label="Description" value={cta.description} onChange={(v) => updateCta({ description: v })} textarea />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Primary Button" value={cta.buttonPrimary} onChange={(v) => updateCta({ buttonPrimary: v })} />
        <Field label="Secondary Button" value={cta.buttonSecondary} onChange={(v) => updateCta({ buttonSecondary: v })} />
      </div>
    </div>
  );
}

const EDITORS: Record<SectionKey, React.FC> = {
  hero: HeroEditor,
  about: AboutEditor,
  divisions: DivisionsEditor,
  documentation: DocumentationEditor,
  faq: FaqEditor,
  cta: CtaEditor,
};

/* ── Main Page ─────────────────────────────────────── */

export default function ContentEditorPage() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("hero");
  const { resetSection, resetAll } = useSectionContentStore();
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
            <h2 className="text-base sm:text-xl font-bold text-primary">Content Editor</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">Edit konten setiap section landing page</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all duration-300">
              <Icon name="restart_alt" size="sm" /> Reset All
            </button>
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
                      <button onClick={(e) => { e.stopPropagation(); resetSection(id); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-outline-variant/20 text-on-surface-variant/50 hover:bg-error/8 hover:text-error hover:border-error/25 transition-all">
                        <Icon name="restart_alt" size="sm" className="!text-xs" /> Reset
                      </button>
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
