"use client";

import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";
import ImageUploadField from "./ImageUploadField";

export default function HeroEditor() {
  const { hero, updateHero } = useSectionContentStore();
  const h = hero;
  return (
    <div className="grid gap-3">
      <ImageUploadField label="Background Image" value={h.image} onChange={(v) => updateHero({ image: v })} />
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
