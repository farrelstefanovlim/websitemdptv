"use client";

import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";
import ImageUploadField from "./ImageUploadField";

export default function HeroEditor() {
  const { hero, updateHero } = useSectionContentStore();
  const h = hero;

  const addStat = () => updateHero({ stats: [...h.stats, { value: "", label: "" }] });
  const removeStat = (i: number) => updateHero({ stats: h.stats.filter((_, idx) => idx !== i) });

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
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40">Stats ({h.stats.length})</span>
          <Button variant="subtle" size="xs" onClick={addStat} startIcon={<Icon name="add" size="sm" className="!text-xs" />}>
            Tambah Stat
          </Button>
        </div>
        <div className="grid gap-2">
          {h.stats.map((stat, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={stat.value} onChange={(e) => { const s = [...h.stats]; s[i] = { ...s[i], value: e.target.value }; updateHero({ stats: s }); }}
                className="w-1/3 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all"
                placeholder="Value" />
              <input type="text" value={stat.label} onChange={(e) => { const s = [...h.stats]; s[i] = { ...s[i], label: e.target.value }; updateHero({ stats: s }); }}
                className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all"
                placeholder="Label" />
              <Button variant="danger" size="xs" onClick={() => removeStat(i)} className="shrink-0 !h-9 !px-2.5">
                <Icon name="delete" size="sm" className="!text-xs" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
