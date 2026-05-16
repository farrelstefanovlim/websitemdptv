export interface SectionConfig {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  order: number;
}

export type LayoutConfig = SectionConfig[];
