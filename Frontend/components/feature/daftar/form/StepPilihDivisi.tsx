"use client";

import Icon from "@/components/ui/Icon";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const DIVISIONS = [
  { value: "Photography & Videography", icon: "photo_camera", color: "bg-secondary/10 border-secondary/20 text-secondary" },
  { value: "Graphic Design", icon: "palette", color: "bg-tertiary-fixed/30 border-on-tertiary-fixed/10 text-on-tertiary-fixed" },
  { value: "Kominfo", icon: "hub", color: "bg-primary-fixed/30 border-on-primary-fixed/10 text-on-primary-fixed" },
];

interface Props {
  selectedDivision: string;
  set: (field: string, value: string) => void;
}

export default function StepPilihDivisi({ selectedDivision, set }: Props) {
  return (
    <AnimateOnScroll variant="fadeUp">
      <div className="mb-6">
        <h2 className="text-xl font-black text-primary mb-1">Pilih Divisi</h2>
        <p className="text-sm text-on-surface-variant/50">Pilih divisi yang paling sesuai dengan minatmu</p>
      </div>
      <div className="grid gap-3">
        {DIVISIONS.map((div) => {
          const selected = selectedDivision === div.value;
          return (
            <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set("division", div.value); } }} key={div.value} onClick={() => set("division", div.value)}
              className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 ${
                selected
                  ? "border-secondary bg-secondary/5 shadow-md shadow-secondary/10"
                  : "border-outline-variant/15 hover:border-outline-variant/30 hover:bg-surface-container-low"
              }`}>
              <div className={`w-12 h-12 rounded-2xl ${div.color} flex items-center justify-center shrink-0 border`}>
                <Icon name={div.icon} filled className="!text-xl" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-primary block">{div.value}</span>
                <span className="text-[10px] text-on-surface-variant/50">
                  {div.value === "Photography & Videography" && "Fotografi, videografi, sinematografi"}
                  {div.value === "Graphic Design" && "Desain grafis, branding, UI/UX"}
                  {div.value === "Kominfo" && "Media sosial, public relations, IT"}
                </span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                selected ? "border-secondary bg-secondary" : "border-outline-variant/25"
              }`}>
                {selected && <Icon name="check" size="sm" className="!text-xs text-white" />}
              </div>
            </div>
          );
        })}
      </div>
    </AnimateOnScroll>
  );
}
