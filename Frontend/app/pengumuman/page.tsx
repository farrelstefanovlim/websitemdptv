"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Footer from "@/components/layout/Footer";
import { recruitmentService } from "@/services/recruitment.service";
import { motion, AnimatePresence } from "framer-motion";

interface AcceptedApplicant {
  name: string;
  npm: string;
  divisionName: string;
}

interface AnnouncementResponse {
  isOpen: boolean;
  accepted?: AcceptedApplicant[];
}

const DIVISION_ICONS: Record<string, string> = {
  "Photography & Videography": "photo_camera",
  "Graphic Design": "palette",
  "Kominfo": "hub",
  "Pengelola Sumber Daya Manusia": "badge",
  "Hubungan Masyarakat": "campaign",
};

export default function PengumumanPage() {
  const [data, setData] = useState<AnnouncementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  useEffect(() => {
    recruitmentService.getAnnouncement()
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setData({ isOpen: false, accepted: [] });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const allAccepted = useMemo(() => data?.accepted || [], [data]);

  // Unique division names
  const divisionNames = useMemo(() => {
    const set = new Set(allAccepted.map((a) => a.divisionName));
    return Array.from(set);
  }, [allAccepted]);

  // Filtered by Search & Tab
  const filteredApplicants = useMemo(() => {
    let list = allAccepted;
    if (selectedDivision !== "all") {
      list = list.filter((a) => a.divisionName === selectedDivision);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.npm.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAccepted, selectedDivision, searchQuery]);

  // Grouped by Division for list view
  const groupedByDivision = useMemo(() => {
    const groups: Record<string, AcceptedApplicant[]> = {};
    filteredApplicants.forEach((app) => {
      if (!groups[app.divisionName]) groups[app.divisionName] = [];
      groups[app.divisionName].push(app);
    });
    return groups;
  }, [filteredApplicants]);

  // Direct Search Match Result
  const searchMatch = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return null;
    const q = searchQuery.toLowerCase().trim();
    return allAccepted.find(
      (a) => a.name.toLowerCase().includes(q) || a.npm.toLowerCase().includes(q)
    );
  }, [allAccepted, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-on-surface relative flex flex-col justify-between">
      <div className="fixed inset-0 noise-bg z-0 pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-20 pointer-events-none" />

      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-on-surface-variant/70 hover:text-primary transition-colors group"
          >
            <Icon name="arrow_back" size="sm" className="group-hover:-translate-x-1 transition-transform !text-xs" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm shadow-secondary/20">
              <Icon name="tv" filled size="sm" className="!text-sm" />
            </div>
            <span className="text-sm font-black tracking-tight text-primary font-display">
              MDPTV
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Announcement Content ────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col pt-8 pb-20 px-4 sm:px-6">
        {loading ? (
          <div className="m-auto flex flex-col items-center justify-center gap-4 py-32">
            <div className="w-10 h-10 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
            <p className="text-xs text-on-surface-variant/60 font-semibold uppercase tracking-wider">
              Memuat Data Pengumuman...
            </p>
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto">
            {!data?.isOpen ? (
              /* ── Closed Announcement State ─────────────────────── */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface-container-lowest rounded-3xl sm:rounded-[40px] p-8 sm:p-16 border border-outline-variant/15 shadow-xl text-center max-w-xl mx-auto"
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                  <Icon name="lock" filled className="text-amber-500 !text-4xl" />
                </div>

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-700 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block mb-3">
                  Status: Belum Dipublikasikan
                </span>

                <h1 className="text-2xl sm:text-4xl font-black text-primary font-display mb-3">
                  Pengumuman Belum Dibuka
                </h1>

                <p className="text-xs sm:text-sm text-on-surface-variant/70 mb-8 leading-relaxed">
                  Hasil seleksi penerimaan anggota baru UKM MDPTV saat ini masih dalam proses peninjauan dan belum dirilis ke publik. Silakan cek kembali nanti atau ikuti pengumuman resmi di media sosial kami.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/daftar"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-white rounded-2xl text-xs font-bold hover:brightness-110 shadow-sm shadow-secondary/20 transition-all"
                  >
                    <Icon name="how_to_reg" size="sm" />
                    <span>Halaman Pendaftaran</span>
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-container-low text-primary rounded-2xl text-xs font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-all"
                  >
                    <Icon name="home" size="sm" />
                    <span>Kembali ke Beranda</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* ── Open Announcement State ──────────────────────── */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Hero Announcement Header */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4">
                    <Icon name="verified" size="sm" className="!text-xs" />
                    Hasil Resmi Seleksi Anggota Baru
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-primary font-display tracking-tight mb-3">
                    Daftar Kelulusan Anggota MDPTV
                  </h1>

                  <p className="text-xs sm:text-sm text-on-surface-variant/70 max-w-lg mx-auto leading-relaxed">
                    Selamat kepada calon anggota yang telah dinyatakan lolos seleksi berkas & wawancara. Sebanyak <strong>{allAccepted.length} mahasiswa</strong> resmi diterima.
                  </p>
                </div>

                {/* Search / Instant NIM Checker */}
                <div className="p-4 sm:p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block">
                    Cek Status Kelulusan (Cari Nama atau NIM)
                  </label>
                  <div className="relative">
                    <Icon
                      name="search"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan NIM atau Nama Lengkap untuk cek hasil..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 text-sm text-primary focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-on-surface-variant/40"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary text-xs font-bold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Instant Match Banner */}
                  {searchMatch && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon name="celebration" filled className="text-emerald-600 !text-xl" />
                        <div>
                          <p className="font-bold text-emerald-950">
                            🎉 Selamat, {searchMatch.name}!
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            Kamu dinyatakan <strong>LOLOS</strong> pada Divisi <strong>{searchMatch.divisionName}</strong>.
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-emerald-700 font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-[11px] shrink-0">
                        {searchMatch.npm}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Division Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedDivision("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      selectedDivision === "all"
                        ? "bg-secondary text-white border-secondary shadow-sm shadow-secondary/20"
                        : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/15 hover:border-outline-variant/30"
                    }`}
                  >
                    Semua Divisi ({allAccepted.length})
                  </button>

                  {divisionNames.map((divName) => {
                    const count = allAccepted.filter((a) => a.divisionName === divName).length;
                    const isActive = selectedDivision === divName;
                    return (
                      <button
                        key={divName}
                        type="button"
                        onClick={() => setSelectedDivision(divName)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                          isActive
                            ? "bg-secondary text-white border-secondary shadow-sm shadow-secondary/20"
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/15 hover:border-outline-variant/30"
                        }`}
                      >
                        <Icon name={DIVISION_ICONS[divName] || "diversity_3"} size="sm" className="!text-xs" />
                        <span>{divName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                            isActive ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant/60"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Division List Cards */}
                {Object.keys(groupedByDivision).length === 0 ? (
                  <div className="p-12 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 text-center text-on-surface-variant/40">
                    <Icon name="search_off" size="lg" className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-primary">Tidak ada nama yang cocok</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">
                      Coba periksa kembali ejaan nama atau digit NIM yang kamu masukkan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedByDivision).map(([division, apps], idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={division}
                        className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 overflow-hidden shadow-sm"
                      >
                        {/* Division Header Banner */}
                        <div className="p-4 sm:px-6 sm:py-4 bg-surface-container-low border-b border-outline-variant/15 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                              <Icon name={DIVISION_ICONS[division] || "diversity_3"} size="sm" filled />
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-primary font-display">
                              {division}
                            </h2>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20">
                            {apps.length} Orang
                          </span>
                        </div>

                        {/* List of Accepted Members */}
                        <div className="divide-y divide-outline-variant/10">
                          {apps.map((app, appIdx) => (
                            <div
                              key={appIdx}
                              className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-on-surface-variant/40 w-6 text-right shrink-0">
                                  {appIdx + 1}.
                                </span>
                                <span className="text-sm font-bold text-primary truncate">
                                  {app.name}
                                </span>
                              </div>
                              <span className="font-mono text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-lg border border-secondary/15 shrink-0 tracking-wider">
                                {app.npm}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
