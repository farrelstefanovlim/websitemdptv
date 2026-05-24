"use client";

import Icon from "@/components/ui/Icon";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";

const sectionColors: Record<string, string> = {
  hero: "bg-primary",
  about: "bg-secondary",
  divisions: "bg-tertiary-fixed-dim",
  documentation: "bg-primary-fixed-dim",
  faq: "bg-secondary-fixed-dim",
  cta: "bg-on-tertiary-fixed-variant",
};

const sectionHeights: Record<string, string> = {
  hero: "h-20",
  about: "h-14",
  divisions: "h-16",
  documentation: "h-12",
  faq: "h-14",
  cta: "h-10",
};

export default function SectionPreview() {
  const { sections } = useLayoutConfigStore();

  const visibleCount = sections.filter((s) => s.visible).length;
  const hiddenCount = sections.length - visibleCount;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Live Preview</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Tampilan layout landing page saat ini
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span>{visibleCount} aktif</span>
          </div>
          {hiddenCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/40">
              <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
              <span>{hiddenCount} hidden</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Container — Simulated Browser */}
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden">
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/15">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          <div className="flex-1 mx-3 px-3 py-1 bg-surface-container rounded-lg text-[10px] text-on-surface-variant/40 font-medium text-center truncate">
            mdptv.vercel.app
          </div>
        </div>

        {/* Navbar placeholder */}
        <div className="mx-3 mt-3 h-6 rounded-lg bg-surface-container-high/60 flex items-center px-3 gap-2">
          <div className="w-8 h-2 rounded bg-primary/15" />
          <div className="flex-1" />
          <div className="flex gap-2">
            <div className="w-6 h-1.5 rounded bg-primary/10" />
            <div className="w-6 h-1.5 rounded bg-primary/10" />
            <div className="w-6 h-1.5 rounded bg-primary/10" />
          </div>
        </div>

        {/* Sections */}
        <div className="p-3 flex flex-col gap-1.5">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`
                rounded-xl flex items-center gap-2 px-3 transition-all duration-500
                ${sectionHeights[section.id] || "h-12"}
                ${
                  section.visible
                    ? `${sectionColors[section.id] || "bg-secondary"} ${
                        section.id === "hero" ? "opacity-90" : "opacity-20"
                      }`
                    : "opacity-[0.04] bg-outline-variant border border-dashed border-outline-variant/30"
                }
              `}
            >
              {section.visible && (
                <>
                  <Icon
                    name={section.icon}
                    size="sm"
                    className={`${
                      section.id === "hero"
                        ? "text-white/70"
                        : "text-primary/40"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest ${
                      section.id === "hero"
                        ? "text-white/50"
                        : "text-primary/30"
                    }`}
                  >
                    {section.label}
                  </span>
                </>
              )}
              {!section.visible && (
                <span className="text-[9px] font-medium text-on-surface-variant/25 line-through mx-auto">
                  {section.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer placeholder */}
        <div className="mx-3 mb-3 h-8 rounded-lg bg-surface-container-high/40 flex items-center justify-center">
          <div className="w-12 h-1.5 rounded bg-primary/8" />
        </div>
      </div>
    </div>
  );
}
