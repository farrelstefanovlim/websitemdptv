"use client";

import { useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useSectionContentStore } from "@/stores/sectionContent.store";

const DIVISION_COLORS: Record<string, string> = {
  "Photography & Videography": "bg-secondary/10 border-secondary/20 text-secondary",
  "Graphic Design": "bg-pink-500/10 border-pink-500/20 text-pink-600",
  "Kominfo": "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  "Pengelola Sumber Daya Manusia": "bg-amber-500/10 border-amber-500/20 text-amber-600",
  "Hubungan Masyarakat": "bg-cyan-500/10 border-cyan-500/20 text-cyan-600",
};

const FALLBACK_COLORS = [
  "bg-indigo-500/10 border-indigo-500/20 text-indigo-600",
  "bg-teal-500/10 border-teal-500/20 text-teal-600",
  "bg-rose-500/10 border-rose-500/20 text-rose-600",
  "bg-purple-500/10 border-purple-500/20 text-purple-600",
  "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
];

const DEFAULT_DIVISIONS = [
  {
    title: "Photography & Videography",
    icon: "photo_camera",
    subtitle: "Visual Storytelling",
    description: "Fotografi panggung, sinematografi, dan editing video profesional",
    features: ["Studio Production", "Sinematografi", "Post-Processing"],
  },
  {
    title: "Graphic Design",
    icon: "palette",
    subtitle: "Identity & Layout",
    description: "Desain visual branding, tipografi, dan aset grafis kreatif",
    features: ["Branding", "UI/UX Design", "Ilustrasi Digital"],
  },
  {
    title: "Kominfo",
    icon: "hub",
    subtitle: "Information Hub",
    description: "Pengelolaan media sosial, publikasi konten, dan infrastruktur IT",
    features: ["Social Media", "Digital Publishing", "IT Support"],
  },
  {
    title: "Pengelola Sumber Daya Manusia",
    icon: "badge",
    subtitle: "Human Resources",
    description: "Pengembangan bakat, kaderisasi, dan manajemen internal anggota",
    features: ["Talent Dev", "Kaderisasi", "Internal Engagement"],
  },
  {
    title: "Hubungan Masyarakat",
    icon: "campaign",
    subtitle: "Public Relations",
    description: "Kemitraan eksternal, media partner, sponsorship, dan relasi publik",
    features: ["Media Partner", "External Relations", "Sponsorship"],
  },
];

interface Props {
  selectedDivision: string;
  set: (field: string, value: string) => void;
  onEnter?: () => void;
}

export default function StepPilihDivisi({ selectedDivision, set, onEnter }: Props) {
  const divisionsContent = useSectionContentStore((s) => s.divisions);
  const fetchSections = useSectionContentStore((s) => s.fetchSections);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        if (target.tagName === "BUTTON" || target.getAttribute("role") === "button") return;
        e.preventDefault();
        if (onEnter) onEnter();
      }
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [onEnter]);

  const rawDivisions = divisionsContent?.divisions || [];
  const divisionList =
    rawDivisions.length > 0 ? rawDivisions : DEFAULT_DIVISIONS;

  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6 text-left">
        <div className="mb-2">
          <Badge variant="default" size="sm" icon="diversity_3">
            Langkah 2 dari 3
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-primary font-display mb-1">
          Pilih Spesialisasi Divisi
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant/60">
          Tentukan divisi utama yang paling sesuai dengan minat dan potensi kreatifmu.
        </p>
      </div>

      <div className="grid gap-3">
        {divisionList.map((div, idx) => {
          const isSelected = selectedDivision === div.title;
          const color =
            DIVISION_COLORS[div.title] ||
            FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

          return (
            <div
              key={div.title}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  set("division", div.title);
                }
              }}
              onClick={() => set("division", div.title)}
              className={`w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-left transition-all duration-300 flex items-start sm:items-center gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30 ${
                isSelected
                  ? "border-secondary bg-secondary/5 shadow-lg shadow-secondary/10 ring-1 ring-secondary/20"
                  : "border-outline-variant/15 hover:border-outline-variant/30 hover:bg-surface-container-low/60"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0 border mt-0.5 sm:mt-0`}
              >
                <Icon name={div.icon || "diversity_3"} filled className="!text-xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm sm:text-base font-bold text-primary font-display truncate">
                    {div.title}
                  </span>
                  {div.subtitle && (
                    <Badge variant="neutral" size="sm">
                      {div.subtitle}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-on-surface-variant/65 line-clamp-2 leading-relaxed mb-2 sm:mb-0">
                  {div.description}
                </p>

                {/* Feature Tags */}
                {Array.isArray(div.features) && div.features.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {div.features.map((feat: string, fi: number) => (
                      <span
                        key={fi}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-surface-container-lowest border border-outline-variant/15 text-on-surface-variant/70"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all mt-1 sm:mt-0 ${
                  isSelected
                    ? "border-secondary bg-secondary shadow-xs shadow-secondary/30"
                    : "border-outline-variant/30 bg-surface-container-lowest"
                }`}
              >
                {isSelected && <Icon name="check" size="sm" className="!text-xs text-white font-bold" />}
              </div>
            </div>
          );
        })}
      </div>
    </AnimateOnScroll>
  );
}
