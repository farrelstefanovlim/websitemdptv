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
import ActionMenu from "@/components/ui/ActionMenu";

const allStatuses: RecruitmentStatus[] = ["pending", "interview", "accepted", "rejected"];
const divisions = [
  "Semua",
  "Photography & Videography",
  "Graphic Design",
  "Kominfo",
  "Pengelola Sumber Daya Manusia",
  "Hubungan Masyarakat",
];
const divisionShort: Record<string, string> = {
  "Semua": "Semua",
  "Photography & Videography": "Photo & Video",
  "Graphic Design": "Design",
  "Kominfo": "Kominfo",
  "Pengelola Sumber Daya Manusia": "PSDM",
  "Hubungan Masyarakat": "Humas",
};

export default function ApplicantTable({ actions }: { actions?: React.ReactNode }) {
  const { applicants } = useRecruitmentStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RecruitmentStatus | "all">("all");
  const [filterDivision, setFilterDivision] = useState("Semua");

  const filtered = applicants.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterDivision !== "Semua" && a.division !== filterDivision) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.npm.includes(search)) return false;
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

      {/* Toolbar: Search, Filter & Actions */}
      <div className="mb-6 flex items-center gap-2 w-full">
        {/* Search */}
        <div className="relative flex-1">
          <Icon name="search" size="sm" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full min-h-[46px] pl-11 pr-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary shadow-sm focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all"
            placeholder="Cari nama atau NPM..." />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Menu */}
          <ActionMenu triggerIcon="filter_list" title="Saring Pelamar" actions={[
            { type: "header", label: "Status" },
            { label: "Semua Status", icon: "list", active: filterStatus === "all", onClick: () => setFilterStatus("all") },
            ...allStatuses.map(s => ({
              label: STATUS_LABELS[s],
              icon: STATUS_ICONS[s],
              active: filterStatus === s,
              onClick: () => setFilterStatus(s)
            })),
            { type: "divider" },
            { type: "header", label: "Divisi" },
            { label: "Semua Divisi", icon: "list", active: filterDivision === "Semua", onClick: () => setFilterDivision("Semua") },
            ...divisions.filter(d => d !== "Semua").map(d => ({
              label: d,
              icon: "group",
              active: filterDivision === d,
              onClick: () => setFilterDivision(d)
            }))
          ]} />

          {/* Actions (from parent) */}
          {actions}
        </div>
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
