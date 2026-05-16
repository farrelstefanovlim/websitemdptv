"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import Button from "@/components/ui/Button";
import type { Applicant, RecruitmentStatus } from "@/components/feature/recruitment/types/recruitment.type";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS } from "@/components/feature/recruitment/types/recruitment.type";

const allStatuses: RecruitmentStatus[] = ["pending", "interview", "accepted", "rejected"];

export default function ApplicantCard({ applicant }: { applicant: Applicant }) {
  const { updateStatus, updateNote } = useRecruitmentStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(applicant.adminNote || "");

  const colors = STATUS_COLORS[applicant.status];

  const handleSaveNote = () => {
    updateNote(applicant.id, noteValue);
    setEditingNote(false);
  };

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden
        ${isExpanded ? "border-secondary/20 shadow-md" : "border-outline-variant/15 hover:border-outline-variant/30"}`}
    >
      {/* Main Row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsExpanded(!isExpanded); } }}
        className="w-full p-3 sm:p-4 bg-surface-container-lowest text-left select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 rounded-xl sm:rounded-2xl block"
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
      </div>

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
              {!editingNote && (
                <Button variant="none" size="none"
                  onClick={() => {
                    setEditingNote(true);
                    setNoteValue(applicant.adminNote || "");
                  }}
                  className="text-[10px] text-secondary font-bold hover:underline"
                >
                  {applicant.adminNote ? "Edit" : "Tambah"}
                </Button>
              )}
            </div>
            {editingNote ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Tulis catatan..."
                  className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10"
                  autoFocus
                />
                <Button variant="primary" size="none"
                  onClick={handleSaveNote}
                  className="px-3 py-2 text-[10px]"
                >
                  Simpan
                </Button>
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
                  <Button variant="none" size="none"
                    key={status}
                    onClick={() => updateStatus(applicant.id, status)}
                    className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border transition-all duration-200
                      ${isActive ? `${sc.bg} ${sc.text} ${sc.border} ring-2 ring-offset-1 ${sc.border}` : "border-outline-variant/15 text-on-surface-variant/40 hover:bg-surface-container-high"}`}
                  >
                    <Icon name={STATUS_ICONS[status]} size="sm" className={`!text-xs ${isActive ? sc.text : ""}`} />
                    {STATUS_LABELS[status]}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
