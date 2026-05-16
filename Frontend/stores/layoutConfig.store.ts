import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SectionConfig } from "@/components/feature/dashboard/types/layoutConfig.type";

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero", label: "Hero", icon: "rocket_launch", visible: true, order: 0 },
  { id: "about", label: "About", icon: "info", visible: true, order: 1 },
  { id: "divisions", label: "Divisions", icon: "hub", visible: true, order: 2 },
  { id: "documentation", label: "Documentation", icon: "description", visible: true, order: 3 },
  { id: "faq", label: "FAQ", icon: "help", visible: true, order: 4 },
];

interface LayoutConfigState {
  sections: SectionConfig[];
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleVisibility: (sectionId: string) => void;
  resetToDefault: () => void;
}

export const useLayoutConfigStore = create<LayoutConfigState>()(
  persist(
    (set) => ({
      sections: DEFAULT_SECTIONS,

      reorderSections: (fromIndex, toIndex) =>
        set((state) => {
          const newSections = [...state.sections];
          const [moved] = newSections.splice(fromIndex, 1);
          newSections.splice(toIndex, 0, moved);
          return {
            sections: newSections.map((s, i) => ({ ...s, order: i })),
          };
        }),

      toggleVisibility: (sectionId) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, visible: !s.visible } : s
          ),
        })),

      resetToDefault: () => set({ sections: DEFAULT_SECTIONS }),
    }),
    { name: "mdptv-layout-config" }
  )
);

export { DEFAULT_SECTIONS };
