"use client";

import Icon from "@/components/ui/Icon";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";

const sectionColors: Record<string, string> = {
  hero: "bg-primary text-white",
  about: "bg-secondary text-white",
  divisions: "bg-blue-600 text-white",
  documentation: "bg-emerald-600 text-white",
  faq: "bg-purple-600 text-white",
  cta: "bg-secondary text-white",
  footer: "bg-neutral-900 text-white",
};

const sectionHeights: Record<string, string> = {
  hero: "h-20",
  about: "h-14",
  divisions: "h-16",
  documentation: "h-14",
  faq: "h-12",
  cta: "h-10",
  footer: "h-8",
};

export default function SectionPreview() {
  const { sections } = useLayoutConfigStore();

  const visibleCount = sections.filter((s) => s.visible).length;
  const hiddenCount = sections.length - visibleCount;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary font-display">
            Simulasi Tampilan
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-0.5">
            Pratinjau struktur landing page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {visibleCount} Aktif
          </span>
          {hiddenCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container-high text-on-surface-variant/50">
              {hiddenCount} Tersembunyi
            </span>
          )}
        </div>
      </div>

      {/* Simulated Browser Frame */}
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden shadow-sm">
        {/* Browser Chrome Bar */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-low border-b border-outline-variant/15">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-2 px-2.5 py-0.5 bg-surface-container-lowest rounded-md text-[10px] text-on-surface-variant/50 font-mono text-center truncate border border-outline-variant/10">
            mdptv.ac.id
          </div>
        </div>

        {/* Mini Navbar */}
        <div className="mx-2.5 mt-2.5 h-6 rounded-lg bg-surface-container-high/70 flex items-center px-2.5 justify-between">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-secondary/80" />
            <div className="w-8 h-1.5 rounded bg-primary/30" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-4 h-1 rounded bg-primary/20" />
            <div className="w-4 h-1 rounded bg-primary/20" />
            <div className="w-4 h-1 rounded bg-primary/20" />
          </div>
        </div>

        {/* Section List Preview */}
        <div className="p-2.5 flex flex-col gap-1.5">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`
                rounded-xl flex items-center justify-between px-3 transition-all duration-300
                ${sectionHeights[section.id] || "h-12"}
                ${
                  section.visible
                    ? `${sectionColors[section.id] || "bg-secondary text-white"} shadow-xs opacity-90`
                    : "opacity-30 bg-surface-container-high border border-dashed border-outline-variant/30 text-on-surface-variant"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon
                  name={section.icon}
                  size="sm"
                  className={section.visible ? "text-white/80" : "text-on-surface-variant/40"}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    section.visible ? "text-white" : "text-on-surface-variant/50 line-through"
                  }`}
                >
                  {section.label}
                </span>
              </div>
              <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest">
                {section.id}
              </span>
            </div>
          ))}
        </div>

        {/* Mini Footer */}
        <div className="mx-2.5 mb-2.5 h-6 rounded-lg bg-surface-container-high/40 flex items-center justify-center">
          <div className="w-16 h-1 rounded bg-primary/15" />
        </div>
      </div>
    </div>
  );
}
