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

const allStatuses: RecruitmentStatus[] = ["pending", "interview", "accepted", "rejected"];
const divisions = ["Semua", "Photography & Videography", "Graphic Design", "Kominfo"];
const divisionShort: Record<string, string> = {
  "Semua": "Semua",
  "Photography & Videography": "Photo & Video",
  "Graphic Design": "Design",
  "Kominfo": "Kominfo",
};

export default function ApplicantTable() {
  const { applicants, updateStatus, updateNote } = useRecruitmentStore();
  const [filterStatus, setFilterStatus] = useState<RecruitmentStatus | "all">("all");
  const [filterDivision, setFilterDivision] = useState("Semua");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const filtered = applicants.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterDivision !== "Semua" && a.division !== filterDivision) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingNote(null);
  };

  const startEditNote = (id: string, currentNote: string) => {
    setEditingNote(id);
    setNoteValue(currentNote);
  };

  const saveNote = (id: string) => {
    updateNote(id, noteValue);
    setEditingNote(null);
  };

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
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
            ${filterStatus === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"}`}
        >
          Semua
        </button>
        {allStatuses.map((status) => {
          const colors = STATUS_COLORS[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
                ${filterStatus === status ? `${colors.bg} ${colors.text} ${colors.border} border` : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"}`}
            >
              <Icon name={STATUS_ICONS[status]} size="sm" className="!text-xs" />
              <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
            </button>
          );
        })}
      </div>

      {/* Division Filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {divisions.map((div) => (
          <button
            key={div}
            onClick={() => setFilterDivision(div)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200
              ${filterDivision === div ? "bg-secondary text-on-secondary border border-transparent" : "bg-surface-container-low text-on-surface-variant/60 border border-outline-variant/15 hover:bg-surface-container-high"}`}
          >
            <span className="sm:hidden">{divisionShort[div]}</span>
            <span className="hidden sm:inline">{div}</span>
          </button>
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
        {filtered.map((applicant) => {
          const colors = STATUS_COLORS[applicant.status];
          const isExpanded = expandedId === applicant.id;

          return (
            <div
              key={applicant.id}
              className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden
                ${isExpanded ? "border-secondary/20 shadow-md" : "border-outline-variant/15 hover:border-outline-variant/30"}`}
            >
              {/* Main Row */}
              <button
                onClick={() => toggleExpand(applicant.id)}
                className="w-full p-3 sm:p-4 bg-surface-container-lowest text-left"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/8 border border-secondary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-secondary">
                      {applicant.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary truncate">
                        {applicant.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] sm:text-[10px] text-on-surface-variant/45 uppercase tracking-widest font-medium">
                        {applicant.nim}
                      </span>
                      <span className="text-on-surface-variant/20">·</span>
                      <span className="text-[9px] sm:text-[10px] text-on-surface-variant/45 truncate">
                        {applicant.division}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border ${colors.bg} ${colors.border} shrink-0`}>
                    <Icon name={STATUS_ICONS[applicant.status]} size="sm" className={`${colors.text} !text-xs`} />
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                      {STATUS_LABELS[applicant.status]}
                    </span>
                  </div>

                  {/* Expand Icon */}
                  <Icon
                    name={isExpanded ? "expand_less" : "expand_more"}
                    size="sm"
                    className="text-on-surface-variant/30 shrink-0"
                  />
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 bg-surface-container-low/50 border-t border-outline-variant/10">
                  <div className="pt-3 sm:pt-4 grid sm:grid-cols-2 gap-3">
                    {/* Contact Info */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Icon name="mail" size="sm" className="text-on-surface-variant/40" />
                        <span className="text-xs text-on-surface-variant">{applicant.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="phone" size="sm" className="text-on-surface-variant/40" />
                        <span className="text-xs text-on-surface-variant">{applicant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="calendar_today" size="sm" className="text-on-surface-variant/40" />
                        <span className="text-xs text-on-surface-variant">
                          Daftar: {new Date(applicant.appliedAt + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Motivation */}
                    <div>
                      <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold block mb-1">
                        Motivasi
                      </span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {applicant.motivation}
                      </p>
                    </div>
                  </div>

                  {/* Admin Note */}
                  <div className="mt-3 pt-3 border-t border-outline-variant/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold">
                        Catatan Admin
                      </span>
                      {editingNote !== applicant.id && (
                        <button
                          onClick={() => startEditNote(applicant.id, applicant.adminNote)}
                          className="text-[10px] text-secondary font-bold uppercase tracking-wider hover:underline"
                        >
                          {applicant.adminNote ? "Edit" : "Tambah"}
                        </button>
                      )}
                    </div>
                    {editingNote === applicant.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          placeholder="Tulis catatan..."
                          className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10"
                          autoFocus
                        />
                        <button
                          onClick={() => saveNote(applicant.id)}
                          className="px-3 py-2 rounded-lg bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-wider"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant/60 italic">
                        {applicant.adminNote || "Belum ada catatan"}
                      </p>
                    )}
                  </div>

                  {/* Status Change Actions */}
                  <div className="mt-3 pt-3 border-t border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold block mb-2">
                      Ubah Status
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allStatuses.map((status) => {
                        const sc = STATUS_COLORS[status];
                        const isActive = applicant.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => updateStatus(applicant.id, status)}
                            className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border transition-all duration-200
                              ${isActive ? `${sc.bg} ${sc.text} ${sc.border} ring-2 ring-offset-1 ${sc.border}` : "border-outline-variant/15 text-on-surface-variant/40 hover:bg-surface-container-high"}`}
                          >
                            <Icon name={STATUS_ICONS[status]} size="sm" className={`!text-xs ${isActive ? sc.text : ""}`} />
                            {STATUS_LABELS[status]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
