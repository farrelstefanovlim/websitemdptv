"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "@/stores/toast.store";
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
  const { updateStatus, updateNote, removeApplicant } = useRecruitmentStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(applicant.adminNote || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
              {/* Interview Status Badge */}
              {applicant.interviewResult ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                  <Icon name="assignment_turned_in" size="xs" />
                  <span>Wawancara Selesai</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-surface-container-high text-on-surface-variant/50 border border-outline-variant/15">
                  <Icon name="pending_actions" size="xs" />
                  <span>Belum Wawancara</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant/60 flex-wrap">
              <span className="font-mono font-semibold text-secondary">
                {applicant.npm}
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
        <div className="px-4 sm:px-6 pb-5 bg-surface-container-low/40 border-t border-outline-variant/10 space-y-4">
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
            <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 space-y-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1">
                  Motivasi & Pengalaman
                </span>
                <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                  {applicant.motivation}
                </p>
              </div>

              {/* Lampiran CV / Foto & Portofolio */}
              <div className="pt-2 border-t border-outline-variant/10 flex flex-wrap gap-2 items-center">
                {applicant.cv_url ? (
                  <a
                    href={applicant.cv_url.startsWith("http") ? applicant.cv_url : `https://${applicant.cv_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                      applicant.cv_url.toLowerCase().includes(".pdf")
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/20"
                        : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/20"
                    }`}
                    title="Buka Berkas CV / Foto Pelamar di Tab Baru"
                  >
                    <Icon name={applicant.cv_url.toLowerCase().includes(".pdf") ? "picture_as_pdf" : "image"} size="xs" />
                    <span>{applicant.cv_url.toLowerCase().includes(".pdf") ? "Buka CV (PDF)" : "Lihat Foto / CV"}</span>
                    <Icon name="open_in_new" size="xs" className="!text-[10px]" />
                  </a>
                ) : (
                  <span className="text-[10px] px-2.5 py-1 rounded-xl bg-surface-container-low text-on-surface-variant/40 font-medium">
                    CV/Foto: -
                  </span>
                )}

                {applicant.portfolio_url ? (
                  <a
                    href={applicant.portfolio_url.startsWith("http") ? applicant.portfolio_url : `https://${applicant.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 font-bold text-xs transition-colors border border-purple-500/20"
                    title="Buka Portofolio Pelamar di Tab Baru"
                  >
                    <Icon name="folder_special" size="xs" />
                    <span>Lihat Portofolio</span>
                    <Icon name="open_in_new" size="xs" className="!text-[10px]" />
                  </a>
                ) : (
                  <span className="text-[10px] px-2.5 py-1 rounded-xl bg-surface-container-low text-on-surface-variant/40 font-medium">
                    Portofolio: -
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hasil Wawancara Section */}
          <div className="pt-3.5 border-t border-outline-variant/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 flex items-center gap-1.5">
                <Icon name="quiz" size="xs" className="text-secondary" />
                <span>Hasil & Dokumentasi Wawancara</span>
              </span>
              {applicant.interviewResult && (
                <span className="text-[11px] text-on-surface-variant/60 font-medium">
                  Pewawancara: <strong className="text-primary">{applicant.interviewResult.interviewer_name || "Admin"}</strong> •{" "}
                  {new Date(applicant.interviewResult.interview_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {applicant.interviewResult ? (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl border border-outline-variant/15">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {applicant.interviewResult.answers.map((ans, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/10 text-xs space-y-1">
                      <p className="font-bold text-secondary text-[11px]">
                        {idx + 1}. {ans.question_text}
                      </p>
                      <p className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/10 text-primary font-medium text-xs leading-relaxed">
                        {ans.answer_text}
                      </p>
                    </div>
                  ))}
                </div>

                {applicant.interviewResult.notes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-[11px]">
                      <Icon name="notes" size="xs" className="text-amber-700" />
                      <span>Catatan Evaluasi Pewawancara:</span>
                    </p>
                    <p className="mt-1 leading-relaxed">{applicant.interviewResult.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-on-surface-variant/60">
                  <Icon name="info" size="xs" className="text-on-surface-variant/40 shrink-0" />
                  <span>Belum ada lembar penilaian wawancara untuk calon anggota ini.</span>
                </div>
                <a
                  href="/admin/wawancara/jawaban"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
                >
                  <Icon name="edit_note" size="xs" />
                  <span>Isi Wawancara</span>
                </a>
              </div>
            )}
          </div>

          {/* Admin Note Section */}
          <div className="pt-3.5 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50">
                Catatan Seleksi Tambahan (Admin)
              </span>
              {!editingNote && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(true);
                    setNoteValue(applicant.adminNote || "");
                  }}
                  className="text-xs text-secondary font-bold hover:underline cursor-pointer"
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
                  placeholder="Tulis catatan seleksi berkas atau hasil musyawarah..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10"
                  autoFocus
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNote}
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

          {/* Status Change & Delete Actions */}
          <div className="pt-3.5 border-t border-outline-variant/10 space-y-3">
            <div>
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

            {/* Delete Applicant Button */}
            <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40">
                Aksi Hapus Data
              </span>
              <Button
                type="button"
                variant="danger"
                size="xs"
                onClick={() => setShowDeleteConfirm(true)}
                startIcon={<Icon name="delete" size="xs" />}
              >
                Hapus Pendaftar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          const success = await removeApplicant(applicant.id);
          if (success) {
            toast.success(`Data pendaftar "${applicant.name}" berhasil dihapus.`);
            setShowDeleteConfirm(false);
          } else {
            toast.error("Gagal menghapus data pendaftar.");
          }
        }}
        title="Hapus Data Pendaftar"
        message={`Apakah Anda yakin ingin menghapus data pendaftar "${applicant.name}" (NPM: ${applicant.npm})? Tindakan ini akan menghapus seluruh data seleksinya secara permanen.`}
        confirmText="Hapus Pendaftar"
        variant="danger"
      />
    </div>
  );
}
