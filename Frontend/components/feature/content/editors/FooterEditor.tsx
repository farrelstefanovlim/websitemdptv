"use client";

import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";

export default function FooterEditor() {
  const { footer, updateFooter } = useSectionContentStore();

  return (
    <div className="grid gap-3">
      <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 mb-1">Sosial Media</div>
      <Field label="Instagram URL" value={footer.instagram} onChange={(v) => updateFooter({ instagram: v })} />
      <Field label="YouTube URL" value={footer.youtube} onChange={(v) => updateFooter({ youtube: v })} />
      <Field label="TikTok URL" value={footer.tiktok} onChange={(v) => updateFooter({ tiktok: v })} />
      
      <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 mt-3 mb-1">Kontak</div>
      <Field label="Email Address (e.g. mailto:email@example.com)" value={footer.email} onChange={(v) => updateFooter({ email: v })} />
      <Field label="WhatsApp URL / Number" value={footer.whatsapp} onChange={(v) => updateFooter({ whatsapp: v })} />
    </div>
  );
}
