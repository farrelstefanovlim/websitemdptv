import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GalleryItem } from "@/components/feature/content/types/content.type";
import { cmsService } from "@/services/cms.service";

export interface GalleryState {
  items: GalleryItem[];
  isLoading: boolean;
  error: string | null;
  fetchGallery: () => Promise<void>;
  addGalleryImage: (item: { label?: string; title?: string; featured?: boolean }, file: File) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  toggleGalleryFeature: (id: string) => Promise<void>;
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      fetchGallery: async () => {
        set({ isLoading: true, error: null });
        try {
          const apiItems = await cmsService.fetchGallery(1, 100);
          set({ items: apiItems, isLoading: false });
        } catch (error: any) {
          set({ error: error?.response?.data?.message || "Gagal memuat galeri.", isLoading: false });
        }
      },

      addGalleryImage: async (itemData, file) => {
        set({ isLoading: true, error: null });
        try {
          const url = await cmsService.uploadImage(file);
          const newItem = {
            label: itemData.label,
            title: itemData.title,
            image_url: url,
            featured: itemData.featured ?? false,
          };
          await cmsService.addGalleryImage(newItem);
          await get().fetchGallery();
        } catch (error: any) {
          set({ error: error?.response?.data?.message || "Gagal menambahkan gambar galeri.", isLoading: false });
          throw error;
        }
      },

      deleteGalleryImage: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await cmsService.deleteGalleryImage(id);
          await get().fetchGallery();
        } catch (error: any) {
          set({ error: error?.response?.data?.message || "Gagal menghapus gambar galeri.", isLoading: false });
          throw error;
        }
      },

      toggleGalleryFeature: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await cmsService.toggleGalleryFeature(id);
          await get().fetchGallery();
        } catch (error: any) {
          set({ error: error?.response?.data?.message || "Gagal mengubah status landing page gambar.", isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "mdptv-gallery-store",
    }
  )
);
