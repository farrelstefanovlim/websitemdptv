"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import type { RecruitmentStatus } from "@/components/feature/recruitment/types/recruitment.type";
import {
  STATUS_LABELS,
  STATUS_ICONS,
  STATUS_COLORS,
} from "@/components/feature/recruitment/types/recruitment.type";
import Button from "@/components/ui/Button";
import ApplicantCard from "./ApplicantCard";

const allStatuses: RecruitmentStatus[] = ["pending", "interview", "accepted", "rejected"];
const divisions = ["Semua", "Photography & Videography", "Graphic Design", "Kominfo"];
const divisionShort: Record<string, string> = {
  "Semua": "Semua",
  "Photography & Videography": "Photo & Video",
  "Graphic Design": "Design",
  "Kominfo": "Kominfo",
};

export default function ApplicantTable() {
  const { applicants } = useRecruitmentStore();
  const [filterStatus, setFilterStatus] = useState<RecruitmentStatus | "all">("all");
  const [filterDivision, setFilterDivision] = useState("Semua");

  const filtered = applicants.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterDivision !== "Semua" && a.division !== filterDivision) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-primary">Daftar Pendaftar</h2>
          <p className="text-[10px] sm:text-sm text-on-surface-variant mt-0.5">
            {filtered.length} pendaftar
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <Button
          variant="none" size="none"
          onClick={() => setFilterStatus("all")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
            ${filterStatus === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"}`}
        >
          Semua
        </Button>
        {allStatuses.map((status) => {
          const colors = STATUS_COLORS[status];
          return (
            <Button
              variant="none" size="none"
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
                ${filterStatus === status ? `${colors.bg} ${colors.text} ${colors.border} border` : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"}`}
            >
              <Icon name={STATUS_ICONS[status]} size="sm" className="!text-xs" />
              <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
            </Button>
          );
        })}
      </div>

      {/* Division Filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {divisions.map((div) => (
          <Button
            variant="none" size="none"
            key={div}
            onClick={() => setFilterDivision(div)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
              ${filterDivision === div ? "bg-secondary text-on-secondary border border-transparent" : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"}`}
          >
            <span className="sm:hidden">{divisionShort[div]}</span>
            <span className="hidden sm:inline">{div}</span>
          </Button>
        ))}
      </div>

      {/* Applicant Cards */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant/30">
            <Icon name="search_off" size="xl" className="mb-2 mx-auto block" />
            <p className="text-sm">Tidak ada pendaftar yang cocok dengan filter</p>
          </div>
        )}
        {filtered.map((applicant) => (
          <ApplicantCard key={applicant.id} applicant={applicant} />
        ))}
      </div>
    </div>
  );
}
