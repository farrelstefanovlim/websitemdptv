"use client";

import Icon from "@/components/ui/Icon";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import Field from "./Field";

export default function DocumentationEditor() {
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
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFeatured(i); } }}
                  key={i}
                  onClick={() => toggleFeatured(i)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50
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
                </div>
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
