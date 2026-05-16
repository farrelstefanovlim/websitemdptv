"use client";

import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";

export default function AboutEditor() {
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
