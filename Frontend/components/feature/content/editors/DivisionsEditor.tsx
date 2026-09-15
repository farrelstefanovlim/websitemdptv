"use client";

import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";
import ImageUploadField from "./ImageUploadField";

const PRESET_ICONS = [
  "photo_camera",
  "palette",
  "hub",
  "badge",
  "campaign",
  "groups",
  "handshake",
  "diversity_3",
  "terminal",
  "article",
  "movie",
  "design_services",
];

export default function DivisionsEditor() {
  const { divisions, updateDivisions } = useSectionContentStore();

  const addDivision = () =>
    updateDivisions({
      divisions: [
        ...divisions.divisions,
        {
          title: "",
          subtitle: "",
          description: "",
          image: "",
          icon: "diversity_3",
          features: [],
        },
      ],
    });

  const removeDivision = (i: number) =>
    updateDivisions({
      divisions: divisions.divisions.filter((_, idx) => idx !== i),
    });
  
  const addFeature = (divIndex: number) => {
    const d = [...divisions.divisions];
    d[divIndex] = { ...d[divIndex], features: [...d[divIndex].features, ""] };
    updateDivisions({ divisions: d });
  };
  const removeFeature = (divIndex: number, featIndex: number) => {
    const d = [...divisions.divisions];
    d[divIndex] = { ...d[divIndex], features: d[divIndex].features.filter((_, idx) => idx !== featIndex) };
    updateDivisions({ divisions: d });
  };

  return (
    <div className="grid gap-3">
      <Field label="Section Label" value={divisions.label} onChange={(v) => updateDivisions({ label: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading Bold" value={divisions.headingBold} onChange={(v) => updateDivisions({ headingBold: v })} />
        <Field label="Heading Italic" value={divisions.headingItalic} onChange={(v) => updateDivisions({ headingItalic: v })} />
      </div>
      <Field label="Description" value={divisions.description} onChange={(v) => updateDivisions({ description: v })} />
      <div>
        <div className="flex items-center justify-between mb-2 pt-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40">Divisi ({divisions.divisions.length})</span>
          <Button variant="none" size="none" onClick={addDivision} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-all">
            <Icon name="add" size="sm" className="!text-xs" /> Tambah Divisi
          </Button>
        </div>
        
        <div className="grid gap-3">
          {divisions.divisions.map((div, i) => (
            <div key={i} className="p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 grid gap-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                    <Icon name={div.icon || "diversity_3"} size="sm" filled />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">
                    Divisi {i + 1}
                  </span>
                </div>
                <Button variant="none" size="none" onClick={() => removeDivision(i)} className="text-error/60 hover:text-error transition-colors">
                  <Icon name="delete" size="sm" className="!text-sm" />
                </Button>
              </div>

              <ImageUploadField label="Cover Image" value={div.image} onChange={(v) => { const d = [...divisions.divisions]; d[i] = { ...d[i], image: v }; updateDivisions({ divisions: d }); }} />
              
              {/* Icon Selector */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1">
                  Icon (Material Symbol)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center text-secondary shrink-0">
                    <Icon name={div.icon || "diversity_3"} size="sm" filled />
                  </div>
                  <input
                    type="text"
                    value={div.icon || ""}
                    onChange={(e) => {
                      const d = [...divisions.divisions];
                      d[i] = { ...d[i], icon: e.target.value };
                      updateDivisions({ divisions: d });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all"
                    placeholder="Contoh: photo_camera, palette, badge, campaign"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase mr-1">Preset:</span>
                  {PRESET_ICONS.map((pIcon) => (
                    <button
                      key={pIcon}
                      type="button"
                      onClick={() => {
                        const d = [...divisions.divisions];
                        d[i] = { ...d[i], icon: pIcon };
                        updateDivisions({ divisions: d });
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${
                        div.icon === pIcon
                          ? "bg-secondary text-white border-secondary shadow-sm"
                          : "bg-surface-container-lowest text-on-surface-variant/60 border-outline-variant/15 hover:border-secondary/40 hover:text-primary"
                      }`}
                    >
                      <Icon name={pIcon} size="sm" className="!text-xs" />
                      {pIcon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 mt-1">
                <input type="text" value={div.title} onChange={(e) => { const d = [...divisions.divisions]; d[i] = { ...d[i], title: e.target.value }; updateDivisions({ divisions: d }); }}
                  className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Title" />
                <input type="text" value={div.subtitle} onChange={(e) => { const d = [...divisions.divisions]; d[i] = { ...d[i], subtitle: e.target.value }; updateDivisions({ divisions: d }); }}
                  className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder="Subtitle" />
              </div>
              <textarea value={div.description} onChange={(e) => { const d = [...divisions.divisions]; d[i] = { ...d[i], description: e.target.value }; updateDivisions({ divisions: d }); }}
                rows={2} className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 transition-all resize-none" placeholder="Description" />
              
              <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 flex items-center justify-between">
                <span>Features ({div.features.length})</span>
                <button onClick={() => addFeature(i)} className="text-secondary hover:underline">Tambah Fitur</button>
              </div>
              <div className="grid gap-2">
                {div.features.map((feat, fi) => (
                  <div key={fi} className="flex gap-2">
                    <input type="text" value={feat} onChange={(e) => { const d = [...divisions.divisions]; const feats = [...d[i].features]; feats[fi] = e.target.value; d[i] = { ...d[i], features: feats }; updateDivisions({ divisions: d }); }}
                      className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary/40 transition-all" placeholder={`Fitur ${fi + 1}`} />
                    <Button variant="none" size="none" onClick={() => removeFeature(i, fi)} className="shrink-0 text-error/60 hover:text-error transition-colors px-2">
                      <Icon name="delete" size="sm" className="!text-sm" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
