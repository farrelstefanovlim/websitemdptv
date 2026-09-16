"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import Button from "@/components/ui/Button";
import type {
  Applicant,
  RecruitmentStatus,
} from "@/components/feature/recruitment/types/recruitment.type";
import {
  STATUS_LABELS,
  STATUS_ICONS,
  STATUS_COLORS,
} from "@/components/feature/recruitment/types/recruitment.type";

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
      className={`rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? "border-secondary/30 bg-surface-container-lowest shadow-md ring-1 ring-secondary/10"
          : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30"
      }`}
    >
      {/* Main Row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full p-4 sm:p-5 bg-surface-container-lowest text-left select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 block"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 font-bold text-sm font-display border border-secondary/15">
            {applicant.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-primary font-display truncate">
                {applicant.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant/60 flex-wrap">
              <span className="font-mono font-semibold text-secondary">
                {applicant.nim}
              </span>
              <span className="opacity-30">•</span>
              <span className="truncate">{applicant.division}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shrink-0 ${colors.bg} ${colors.border}`}
          >
            <Icon
              name={STATUS_ICONS[applicant.status]}
              size="sm"
              className={`${colors.text} !text-xs`}
              filled
            />
            <span className={colors.text}>{STATUS_LABELS[applicant.status]}</span>
          </div>

          {/* Expand Icon */}
          <Icon
            name={isExpanded ? "expand_less" : "expand_more"}
            size="sm"
            className="text-on-surface-variant/40 shrink-0"
          />
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-5 bg-surface-container-low/40 border-t border-outline-variant/10">
          <div className="pt-4 grid sm:grid-cols-2 gap-4">
            {/* Contact & Date Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <Icon name="mail" size="sm" className="text-secondary/70 !text-sm" />
                <span className="font-medium truncate">{applicant.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <Icon name="phone" size="sm" className="text-secondary/70 !text-sm" />
                <span className="font-medium">{applicant.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <Icon name="calendar_today" size="sm" className="text-secondary/70 !text-sm" />
                <span className="font-medium">
                  Terdaftar:{" "}
                  {new Date(applicant.appliedAt + "T00:00:00").toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </span>
              </div>
            </div>

            {/* Motivation Statement */}
            <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1">
                Motivasi & Pengalaman
              </span>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                {applicant.motivation}
              </p>
            </div>
          </div>

          {/* Admin Note Section */}
          <div className="mt-4 pt-3.5 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50">
                Catatan Evaluasi Admin
              </span>
              {!editingNote && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(true);
                    setNoteValue(applicant.adminNote || "");
                  }}
                  className="text-xs text-secondary font-bold hover:underline"
                >
                  {applicant.adminNote ? "Edit Catatan" : "+ Tambah Catatan"}
                </button>
              )}
            </div>

            {editingNote ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Tulis catatan hasil wawancara / portofolio..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10"
                  autoFocus
                />
                <Button
                  variant="primary"
                  size="none"
                  onClick={handleSaveNote}
                  className="px-3.5 py-2 text-xs font-bold"
                >
                  Simpan
                </Button>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/70 italic bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/10">
                {applicant.adminNote || "Belum ada catatan evaluasi untuk pelamar ini."}
              </p>
            )}
          </div>

          {/* Status Change Buttons */}
          <div className="mt-4 pt-3.5 border-t border-outline-variant/10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-2">
              Ubah Status Seleksi
            </span>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map((status) => {
                const sc = STATUS_COLORS[status];
                const isActive = applicant.status === status;
                return (
                  <button
                    type="button"
                    key={status}
                    onClick={() => updateStatus(applicant.id, status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? `${sc.bg} ${sc.text} ${sc.border} border-2 shadow-sm`
                        : "bg-surface-container-lowest text-on-surface-variant/60 border border-outline-variant/15 hover:border-secondary/40 hover:text-primary"
                    }`}
                  >
                    <Icon
                      name={STATUS_ICONS[status]}
                      size="sm"
                      className={`!text-xs ${isActive ? sc.text : ""}`}
                      filled={isActive}
                    />
                    <span>{STATUS_LABELS[status]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
