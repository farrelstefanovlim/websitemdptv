"use client";

import { useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ApplicantTable from "@/components/feature/recruitment/ApplicantTable";
import RecruitmentStats from "@/components/feature/recruitment/RecruitmentStats";
import { toast } from "@/stores/toast.store";
import ActionMenu from "@/components/ui/ActionMenu";
import { useRecruitmentStore } from "@/stores/recruitment.store";
import { useHydrated } from "@/hooks/useHydrated";
import { exportToExcel, importFromExcel, RECRUITMENT_COLUMNS } from "@/lib/excel";

import { createPortal } from "react-dom";
import { usePortalTarget } from "@/hooks/usePortalTarget";

export default function RecruitmentPage() {
  const portalTarget = usePortalTarget("mobile-topbar-actions");
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title");
  const { applicants, addApplicant, registrationOpen, toggleRegistration, announcementOpen, toggleAnnouncement, fetchAnnouncementState, fetchApplicants, groupLink, setGroupLink, fetchGroupLink, saveGroupLinkToDb, isLoading } = useRecruitmentStore();
  const pendingCount = applicants.filter((a) => a.status === "pending").length;
  const hydrated = useHydrated();
  const importRef = useRef<HTMLInputElement>(null);

  // Fetch data dari API saat mount
  useEffect(() => {
    fetchApplicants();
    fetchAnnouncementState();
    fetchGroupLink();
  }, [fetchApplicants, fetchAnnouncementState, fetchGroupLink]);

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
      toast.success(`Berhasil import ${imported} pendaftar`);
    } catch { toast.error("Gagal membaca file Excel"); }
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }


  const topbarTitle = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">
        Penerimaan Anggota
      </h2>
      <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">
        Kelola pendaftaran calon anggota MDPTV
      </p>
    </div>
  );

  const topbarActions = (
    <>
      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] font-bold">
            {pendingCount} Pending
          </span>
        </div>
      )}
    </>
  );

  return (
    <>
      {hydrated && mobileTitlePortalTarget && createPortal(topbarTitle, mobileTitlePortalTarget)}
      {hydrated && portalTarget && createPortal(topbarActions, portalTarget)}

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Registration Configs & Toolbar */}
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Registration Open/Close Toggle */}
            <div className={`rounded-2xl border-2 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-4 transition-all duration-300 ${
              registrationOpen ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
            }`}>
              <div className="flex items-center gap-3">
                <Icon name={registrationOpen ? "lock_open" : "lock"} filled className={`!text-xl ${registrationOpen ? "text-green-600" : "text-red-500"}`} />
                <div>
                  <p className="text-sm font-bold text-primary">Daftar {registrationOpen ? "Dibuka" : "Ditutup"}</p>
                  <p className="text-[10px] text-on-surface-variant/50">{registrationOpen ? "/daftar bisa diakses" : "/daftar ditutup"}</p>
                </div>
              </div>
              <div role="button" tabIndex={0} onClick={toggleRegistration} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRegistration(); } }} className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 cursor-pointer ${registrationOpen ? "bg-green-500" : "bg-red-400"}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${registrationOpen ? "left-6" : "left-1"}`} />
              </div>
            </div>

            {/* Announcement Open/Close Toggle */}
            <div className={`rounded-2xl border-2 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-4 transition-all duration-300 ${
              announcementOpen ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-slate-50/50"
            }`}>
              <div className="flex items-center gap-3">
                <Icon name={announcementOpen ? "campaign" : "visibility_off"} filled className={`!text-xl ${announcementOpen ? "text-blue-600" : "text-slate-500"}`} />
                <div>
                  <p className="text-sm font-bold text-primary">Hasil {announcementOpen ? "Dibuka" : "Ditutup"}</p>
                  <p className="text-[10px] text-on-surface-variant/50">{announcementOpen ? "/pengumuman tampil" : "Peserta diblokir"}</p>
                </div>
              </div>
              <div role="button" tabIndex={0} onClick={toggleAnnouncement} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAnnouncement(); } }} className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 cursor-pointer ${announcementOpen ? "bg-blue-500" : "bg-slate-400"}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${announcementOpen ? "left-6" : "left-1"}`} />
              </div>
            </div>

            {/* Whatsapp Link Input */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 flex flex-col justify-center shadow-sm lg:col-span-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50 mb-1.5 flex items-center gap-1.5">
                <Icon name="link" size="sm" /> Link WhatsApp
              </label>
              {/* Perubahan: Menambahkan pembungkus div dan tombol simpan */}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={groupLink} 
                  onChange={(e) => setGroupLink(e.target.value)} 
                  placeholder="https://chat.whatsapp.com/..." 
                  className="flex-1 w-full text-xs sm:text-sm py-2 px-3 border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-on-surface-variant/30 text-primary bg-background" 
                />
                <Button 
                  variant="primary" 
                  onClick={async () => {
                    const success = await saveGroupLinkToDb(groupLink);
                    if (success) toast.success("Link berhasil disimpan!");
                  }}
                  disabled={isLoading}
                  className="!py-2 !px-4" // Menyesuaikan tinggi dengan input
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
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
              <ApplicantTable actions={
                <>
                  <ActionMenu actions={[
                    { label: "Import Excel", icon: "upload", onClick: () => importRef.current?.click() },
                    { label: "Export Excel", icon: "download", onClick: handleExport, variant: "success" },
                  ]} />
                  <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                </>
              } />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
