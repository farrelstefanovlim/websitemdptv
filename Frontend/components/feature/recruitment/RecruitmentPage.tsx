"use client";

import { useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ApplicantTable from "@/components/feature/recruitment/ApplicantTable";
import RecruitmentStats from "@/components/feature/recruitment/RecruitmentStats";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, RECRUITMENT_COLUMNS } from "@/lib/excel";

import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";

export default function RecruitmentPage() {
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const { applicants, addApplicant, registrationOpen, toggleRegistration } = useRecruitmentStore();
  const pendingCount = applicants.filter((a) => a.status === "pending").length;
  const hydrated = useHydrated();
  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToExcel(applicants, RECRUITMENT_COLUMNS, "penerimaan_anggota", "Pendaftar");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importFromExcel(
        file,
        RECRUITMENT_COLUMNS
      );
      let imported = 0;
      for (const row of rows) {
        if (!row.name || !row.nim) continue;
        addApplicant({
          name: row.name,
          nim: row.nim,
          email: row.email || "",
          phone: row.phone || "",
          division: row.division || "Photography & Videography",
          motivation: row.motivation || "",
        });
        imported++;
      }
      alert(`Berhasil import ${imported} pendaftar`);
    } catch { alert("Gagal membaca file Excel"); }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const mobileActions = (
    <>
      <Button variant="success" size="none" onClick={handleExport} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="download" size="sm" />
      </Button>
      <Button variant="outline" size="none" onClick={() => importRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
        <Icon name="upload" size="sm" />
      </Button>
      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-medium text-orange-500">
            {pendingCount}
          </span>
        </div>
      )}
      <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
    </>
  );

  const mobileTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-[14px] font-bold text-primary truncate leading-tight">
        Penerimaan Anggota
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5">
        Kelola pendaftaran calon anggota MDPTV
      </p>
    </div>
  );

  return (
    <>
      {hydrated && portalTarget && createPortal(mobileActions, portalTarget)}
      {hydrated && mobileTitlePortalTarget && createPortal(mobileTitle, mobileTitlePortalTarget)}
      {/* Top Bar */}
      <header className="hidden lg:block sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-primary">
              Penerimaan Anggota
            </h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/50">
              Kelola pendaftaran calon anggota MDPTV
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            <Button variant="success" size="sm" onClick={handleExport} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs">
              <Icon name="download" size="sm" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()} className="px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs">
              <Icon name="upload" size="sm" /> <span className="hidden sm:inline">Import</span>
            </Button>
            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            {pendingCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-medium text-orange-500">
                  {pendingCount} pending
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 sm:p-8">
        {/* Registration Toggle */}
        <div className={`mb-4 sm:mb-6 rounded-2xl border-2 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4 transition-all duration-300 ${
          registrationOpen
            ? "border-green-200 bg-green-50/50"
            : "border-red-200 bg-red-50/50"
        }`}>
          <div className="flex items-center gap-3">
            <Icon
              name={registrationOpen ? "lock_open" : "lock"}
              filled
              className={`!text-xl ${registrationOpen ? "text-green-600" : "text-red-500"}`}
            />
            <div>
              <p className="text-sm font-bold text-primary">
                Pendaftaran {registrationOpen ? "Dibuka" : "Ditutup"}
              </p>
              <p className="text-[10px] sm:text-xs text-on-surface-variant/50">
                {registrationOpen
                  ? "Halaman /daftar bisa diakses pengunjung"
                  : "Halaman /daftar tidak bisa diakses pengunjung"}
              </p>
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={toggleRegistration}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRegistration(); } }}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 shrink-0 cursor-pointer ${
              registrationOpen ? "bg-green-500" : "bg-red-400"
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
              registrationOpen ? "left-7" : "left-1"
            }`} />
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-8">
          {/* Stats — shown first on mobile */}
          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-3 sm:p-6 lg:sticky lg:top-24">
              <RecruitmentStats />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 lg:order-1">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/15 p-3 sm:p-6">
              <ApplicantTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
