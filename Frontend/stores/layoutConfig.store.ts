import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SectionConfig } from "@/components/feature/layoutEditor/types/layoutConfig.type";

import { cmsService } from "@/services/cms.service";

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero", label: "Hero", icon: "rocket_launch", visible: true, order: 0 },
  { id: "about", label: "About", icon: "info", visible: true, order: 1 },
  { id: "divisions", label: "Divisions", icon: "hub", visible: true, order: 2 },
  { id: "documentation", label: "Documentation", icon: "description", visible: true, order: 3 },
  { id: "faq", label: "FAQ", icon: "help", visible: true, order: 4 },
];

interface LayoutConfigState {
  sections: SectionConfig[];
  isLoading: boolean;
  error: string | null;
  fetchSections: () => Promise<void>;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleVisibility: (sectionId: string) => void;
  resetToDefault: () => void;
}

export const useLayoutConfigStore = create<LayoutConfigState>()(
  persist(
    (set) => ({
      sections: DEFAULT_SECTIONS,
      isLoading: false,
      error: null,

      fetchSections: async () => {
        set({ isLoading: true, error: null });
        try {
          const apiSections = await cmsService.fetchLayoutSections();
          if (apiSections.length > 0) {
            set({ sections: apiSections, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          // Fallback to defaults if API is unavailable
          set({ isLoading: false });
        }
      },

      reorderSections: (fromIndex, toIndex) =>
        set((state) => {
          const newSections = [...state.sections];
          const [moved] = newSections.splice(fromIndex, 1);
          newSections.splice(toIndex, 0, moved);
          
          const updated = newSections.map((s, i) => ({ ...s, order: i }));
          cmsService.updateLayouts(updated.map((s) => ({ id: s.id, order: s.order, visible: s.visible })));

          return { sections: updated };
        }),

      toggleVisibility: (sectionId) =>
        set((state) => {
          const updated = state.sections.map((s) =>
            s.id === sectionId ? { ...s, visible: !s.visible } : s
          );
          cmsService.updateLayouts(updated.map((s) => ({ id: s.id, order: s.order, visible: s.visible })));

          return { sections: updated };
        }),

      resetToDefault: () => set(() => {
        cmsService.updateLayouts(DEFAULT_SECTIONS.map((s) => ({ id: s.id, order: s.order, visible: s.visible })));
        return { sections: DEFAULT_SECTIONS };
      }),
    }),
    { name: "mdptv-layout-config" }
  )
);

export { DEFAULT_SECTIONS };
