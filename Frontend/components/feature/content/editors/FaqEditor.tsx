"use client";

import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";

export default function FaqEditor() {
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
          <Button variant="none" size="none" onClick={addItem} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-all">
            <Icon name="add" size="sm" className="!text-xs" /> Tambah
          </Button>
        </div>
        <div className="grid gap-2">
          {faq.items.map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low/50 grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-secondary">FAQ #{i + 1}</span>
                <Button variant="none" size="none" onClick={() => removeItem(i)} className="text-error/60 hover:text-error transition-colors">
                  <Icon name="delete" size="sm" className="!text-sm" />
                </Button>
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
