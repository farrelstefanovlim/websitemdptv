import api from "@/lib/axios";
import type { SectionConfig } from "@/components/feature/layoutEditor/types/layoutConfig.type";
import type { GalleryItem } from "@/components/feature/content/types/content.type";

/* ── Mappers ── */
const mapLayoutSection = (s: any): SectionConfig => ({
  id: s.section_key,
  label: s.label,
  icon: s.icon || "article",
  visible: s.visible,
  order: s.order,
});

const mapGalleryImage = (img: any): GalleryItem => ({
  id: img.id,
  label: img.label || "",
  title: img.title || "",
  image: img.image_url,
  uploadedAt: img.uploaded_at ? new Date(img.uploaded_at).toISOString().split("T")[0] : "",
  featured: img.featured || false,
});

export const cmsService = {
  /** Fetch layout sections — returns frontend-ready SectionConfig[] */
  fetchLayoutSections: async (): Promise<SectionConfig[]> => {
    const res = await api.get("/cms/sections");
    return (res.data.data || []).map(mapLayoutSection);
  },

  /** Fetch section contents — returns raw section data with content JSON */
  fetchSectionContents: async (): Promise<any[]> => {
    const res = await api.get("/cms/sections");
    return res.data.data || [];
  },

  /** Fetch gallery — returns frontend-ready GalleryItem[] */
  fetchGallery: async (page = 1, limit = 100): Promise<GalleryItem[]> => {
    const res = await api.get("/cms/gallery", { params: { page, limit } });
    return (res.data.data || []).map(mapGalleryImage);
  },

  /** Upload image file — returns URL string */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  },

  /** Update section content */
  updateSection: (key: string, content: Record<string, unknown>) =>
    api.put(`/cms/sections/${key}`, content),

  /** Bulk update layout order & visibility */
  updateLayouts: (layouts: { id: string; order: number; visible: boolean }[]) =>
    api.patch("/cms/sections/layouts", { layouts }),

  /* Raw calls */
  getSections: () => api.get("/cms/sections"),
  getGallery: (page = 1, limit = 12) =>
    api.get("/cms/gallery", { params: { page, limit } }),
  
  addGalleryImage: (data: { label?: string; title?: string; image_url: string; featured?: boolean }) =>
    api.post("/cms/gallery", data),
    
  deleteGalleryImage: (id: string) =>
    api.delete(`/cms/gallery/${id}`),
    
  toggleGalleryFeature: (id: string) =>
    api.patch(`/cms/gallery/${id}/feature`)
};
