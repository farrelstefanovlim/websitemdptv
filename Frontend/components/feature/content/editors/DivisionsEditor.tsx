"use client";

import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";

export default function DivisionsEditor() {
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
