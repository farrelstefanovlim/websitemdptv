"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { dashboardService, DashboardMetrics } from "@/services/dashboard.service";
import { useAuthStore } from "@/stores/auth.store";

const DIVISION_META: Record<
  string,
  { icon: string; colorStr: string; textStr: string; lightBg: string }
> = {
  "Photography & Videography": {
    icon: "photo_camera",
    colorStr: "bg-blue-500",
    textStr: "text-blue-500",
    lightBg: "bg-blue-500/10",
  },
  "Graphic Design": {
    icon: "palette",
    colorStr: "bg-pink-500",
    textStr: "text-pink-500",
    lightBg: "bg-pink-500/10",
  },
  "Kominfo": {
    icon: "hub",
    colorStr: "bg-emerald-500",
    textStr: "text-emerald-500",
    lightBg: "bg-emerald-500/10",
  },
  "Pengelola Sumber Daya Manusia": {
    icon: "badge",
    colorStr: "bg-amber-500",
    textStr: "text-amber-500",
    lightBg: "bg-amber-500/10",
  },
  "Hubungan Masyarakat": {
    icon: "campaign",
    colorStr: "bg-cyan-500",
    textStr: "text-cyan-500",
    lightBg: "bg-cyan-500/10",
  },
  "Public Relations": {
    icon: "campaign",
    colorStr: "bg-cyan-500",
    textStr: "text-cyan-500",
    lightBg: "bg-cyan-500/10",
  },
  "Journalism": {
    icon: "article",
    colorStr: "bg-violet-500",
    textStr: "text-violet-500",
    lightBg: "bg-violet-500/10",
  },
};

const FALLBACK_PALETTES = [
  { icon: "diversity_3", colorStr: "bg-indigo-500", textStr: "text-indigo-500", lightBg: "bg-indigo-500/10" },
  { icon: "groups", colorStr: "bg-teal-500", textStr: "text-teal-500", lightBg: "bg-teal-500/10" },
  { icon: "handshake", colorStr: "bg-rose-500", textStr: "text-rose-500", lightBg: "bg-rose-500/10" },
  { icon: "work", colorStr: "bg-amber-600", textStr: "text-amber-600", lightBg: "bg-amber-600/10" },
  { icon: "movie", colorStr: "bg-purple-600", textStr: "text-purple-600", lightBg: "bg-purple-600/10" },
  { icon: "design_services", colorStr: "bg-fuchsia-500", textStr: "text-fuchsia-500", lightBg: "bg-fuchsia-500/10" },
  { icon: "terminal", colorStr: "bg-emerald-600", textStr: "text-emerald-600", lightBg: "bg-emerald-600/10" },
];

export default function OverviewDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    dashboardService
      .fetchMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat metrik dashboard:", err);
        setLoading(false);
      });
  }, []);

  // Aggregated data calculations
  const totalMembers = metrics?.members.total || 0;
  const rawByDivision = useMemo(() => metrics?.members.byDivision || [], [metrics]);

  const divisionList = useMemo(() => {
    return rawByDivision.map((d, idx) => {
      const meta = DIVISION_META[d.name] || FALLBACK_PALETTES[idx % FALLBACK_PALETTES.length];
      return {
        id: d.name,
        title: d.name,
        count: d.count,
        icon: meta.icon,
        colorStr: meta.colorStr,
        textStr: meta.textStr,
        lightBg: meta.lightBg,
      };
    });
  }, [rawByDivision]);

  const totalApplicants = metrics?.applicants.total || 0;
  const pendingApplicants =
    metrics?.applicants.byStatus.find((f) => f.status === "pending")?.count || 0;
  const interviewApplicants =
    metrics?.applicants.byStatus.find((f) => f.status === "interview")?.count || 0;
  const acceptedApplicants =
    metrics?.applicants.byStatus.find((f) => f.status === "accepted")?.count || 0;
  const rejectedApplicants =
    metrics?.applicants.byStatus.find((f) => f.status === "rejected")?.count || 0;

  const totalKegiatan = metrics?.kegiatan.total || 0;
  const upcomingKegiatans = metrics?.kegiatan.upcoming || [];

  // Attendance Metrics
  const todayTotal = metrics?.attendance.todayTotal || 0;
  const presentCount =
    metrics?.attendance.byStatus.find((r) => r.status === "present")?.count || 0;
  const lateCount =
    metrics?.attendance.byStatus.find((r) => r.status === "late")?.count || 0;
  const excusedCount =
    metrics?.attendance.byStatus.find((r) => r.status === "excused")?.count || 0;
  const absentCount =
    metrics?.attendance.byStatus.find((r) => r.status === "absent")?.count || 0;

  const responseRate =
    totalMembers > 0 ? Math.round((todayTotal / totalMembers) * 100) : 0;
  const acceptRate =
    totalApplicants > 0 ? Math.round((acceptedApplicants / totalApplicants) * 100) : 0;

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
        <p className="text-xs text-on-surface-variant/50 font-medium tracking-wider uppercase">
          Menyiapkan Command Center...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── 1. Top Command Header ─────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Icon name="terminal" size="md" filled />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-primary">
                Selamat Datang, {user?.username || "Admin"}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Database
              </span>
            </div>
            <p className="text-xs text-on-surface-variant/60 mt-1 font-medium">
              {todayFormatted} • Pusat Pengelolaan & Operasional MDPTV
            </p>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link
            href="/admin/absensi"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-primary border border-outline-variant/20 hover:border-secondary/40 hover:text-secondary transition-all"
          >
            <Icon name="today" size="sm" />
            <span>Presensi</span>
          </Link>
          <Link
            href="/admin/kegiatan"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-primary border border-outline-variant/20 hover:border-secondary/40 hover:text-secondary transition-all"
          >
            <Icon name="event" size="sm" />
            <span>Event Baru</span>
          </Link>
          <Link
            href="/admin/penerimaan"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-container-low text-primary border border-outline-variant/20 hover:border-secondary/40 hover:text-secondary transition-all"
          >
            <Icon name="how_to_reg" size="sm" />
            <span>Pelamar</span>
            {pendingApplicants > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-secondary text-white font-bold">
                {pendingApplicants}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── 2. Primary Metrics Bento Grid ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Anggota */}
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">
              Total Anggota
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Icon name="groups" filled />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-primary font-display">
                {totalMembers}
              </span>
              <span className="text-xs font-medium text-on-surface-variant/50">
                anggota aktif
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10 text-[11px]">
              <span className="text-on-surface-variant/60 font-medium">
                {divisionList.length} Divisi Terdaftar
              </span>
              <Link
                href="/admin/members"
                className="text-blue-500 font-semibold hover:underline"
              >
                Kelola →
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Pipeline Rekrutmen */}
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">
              Calon Pendaftar
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Icon name="contact_page" filled />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-primary font-display">
                {totalApplicants}
              </span>
              <span className="text-xs font-medium text-on-surface-variant/50">
                total berkas
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10 text-[11px]">
              <span className="text-emerald-600 font-medium">
                {acceptedApplicants} lolos ({acceptRate}%)
              </span>
              <Link
                href="/admin/penerimaan"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Seleksi →
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Kegiatan Terdaftar */}
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">
              Agenda & Kegiatan
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <Icon name="event" filled />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-primary font-display">
                {totalKegiatan}
              </span>
              <span className="text-xs font-medium text-on-surface-variant/50">
                event terdata
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10 text-[11px]">
              <span className="text-on-surface-variant/60 font-medium">
                Produksi & Workshop
              </span>
              <Link
                href="/admin/kegiatan"
                className="text-purple-600 font-semibold hover:underline"
              >
                Jadwal →
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Portal Pendaftaran Publik */}
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60">
              Portal Pendaftaran
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                metrics.registrationOpen
                  ? "bg-secondary/10 text-secondary"
                  : "bg-outline-variant/15 text-on-surface-variant/40"
              }`}
            >
              <Icon name={metrics.registrationOpen ? "toggle_on" : "toggle_off"} size="md" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl sm:text-2xl font-bold ${
                  metrics.registrationOpen ? "text-secondary" : "text-on-surface-variant/60"
                }`}
              >
                {metrics.registrationOpen ? "Sedang Dibuka" : "Ditutup"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10 text-[11px]">
              <span className="text-on-surface-variant/60 font-medium">
                Formulir Mahasiswa
              </span>
              <Link
                href="/admin/penerimaan"
                className="text-secondary font-semibold hover:underline"
              >
                Ubah Status →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Row: Attendance & Recruitment Funnel ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Attendance Widget (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Icon name="today" filled />
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary">
                    Presensi Studio Hari Ini
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold mt-0.5">
                    Monitoring kehadiran real-time
                  </p>
                </div>
              </div>
              <Link
                href="/admin/absensi"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Buka Absensi →
              </Link>
            </div>

            {totalMembers > 0 ? (
              <div className="space-y-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-primary font-display">
                      {todayTotal}
                    </span>
                    <span className="text-sm font-semibold text-on-surface-variant/40 ml-1.5">
                      / {totalMembers} responden
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                    {responseRate}% Kehadiran
                  </div>
                </div>

                {/* Progress Bar with Multiple Statuses */}
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden flex ring-1 ring-inset ring-outline-variant/10">
                  {todayTotal === 0 && <div className="w-full bg-outline-variant/10" />}
                  <div
                    style={{ width: `${(presentCount / totalMembers) * 100}%` }}
                    className="bg-emerald-500"
                    title={`Hadir: ${presentCount}`}
                  />
                  <div
                    style={{ width: `${(lateCount / totalMembers) * 100}%` }}
                    className="bg-amber-500"
                    title={`Telat: ${lateCount}`}
                  />
                  <div
                    style={{ width: `${(excusedCount / totalMembers) * 100}%` }}
                    className="bg-blue-500"
                    title={`Izin: ${excusedCount}`}
                  />
                  <div
                    style={{ width: `${(absentCount / totalMembers) * 100}%` }}
                    className="bg-rose-500"
                    title={`Alpa: ${absentCount}`}
                  />
                </div>

                {/* Status Chips */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Hadir
                    </div>
                    <span className="text-base font-bold text-primary font-display">
                      {presentCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Telat
                    </div>
                    <span className="text-base font-bold text-primary font-display">
                      {lateCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Izin
                    </div>
                    <span className="text-base font-bold text-primary font-display">
                      {excusedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Alpa
                    </div>
                    <span className="text-base font-bold text-primary font-display">
                      {absentCount}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <Icon name="history" className="text-on-surface-variant/40" size="lg" />
                <p className="text-xs font-semibold text-on-surface-variant mt-2">
                  Belum ada data absensi tercatat hari ini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recruitment Funnel & Pipeline (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Icon name="filter_alt" filled />
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary">
                    Pipeline Rekrutmen Anggota
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold mt-0.5">
                    Tahapan seleksi calon anggota baru
                  </p>
                </div>
              </div>
              <Link
                href="/admin/penerimaan"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Lihat Semua Pelamar →
              </Link>
            </div>

            {/* Funnel Stage Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Pending
                </span>
                <span className="text-2xl font-black text-primary font-display mt-1 block">
                  {pendingApplicants}
                </span>
                <span className="text-[10px] text-on-surface-variant/50 font-medium">
                  Perlu review
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/5 border border-secondary/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                  Wawancara
                </span>
                <span className="text-2xl font-black text-primary font-display mt-1 block">
                  {interviewApplicants}
                </span>
                <span className="text-[10px] text-on-surface-variant/50 font-medium">
                  Tahap interview
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Diterima
                </span>
                <span className="text-2xl font-black text-primary font-display mt-1 block">
                  {acceptedApplicants}
                </span>
                <span className="text-[10px] text-on-surface-variant/50 font-medium">
                  Resmi anggota
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Ditolak
                </span>
                <span className="text-2xl font-black text-primary font-display mt-1 block">
                  {rejectedApplicants}
                </span>
                <span className="text-[10px] text-on-surface-variant/50 font-medium">
                  Tidak memenuhi
                </span>
              </div>
            </div>

            {/* Notification Bar if pending reviews exist */}
            {pendingApplicants > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                    <Icon name="mark_email_unread" size="sm" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary">
                      Terdapat {pendingApplicants} berkas pelamar baru yang belum ditinjau
                    </p>
                    <p className="text-[10px] text-on-surface-variant/60 font-medium">
                      Buka menu penerimaan untuk meninjau motivasi dan menentukan status wawancara.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/penerimaan"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all shrink-0"
                >
                  Tinjau
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-center gap-3 text-xs text-on-surface-variant/60">
                <Icon name="verified" className="text-emerald-500" size="sm" />
                <span>Seluruh berkas pelamar telah ditinjau dan diperbarui.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Divisions Distribution & Upcoming Events ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Divisions Distribution (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Icon name="donut_large" filled />
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary">
                    Distribusi Divisi Studio
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold mt-0.5">
                    {divisionList.length} divisi aktif terdata
                  </p>
                </div>
              </div>
              <Link
                href="/admin/content"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Edit di CMS →
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {divisionList.map((div) => {
                const percentage =
                  totalMembers > 0 ? Math.round((div.count / totalMembers) * 100) : 0;
                return (
                  <div key={div.id} className="flex items-center gap-3.5 group">
                    <div
                      className={`w-10 h-10 rounded-xl ${div.lightBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                    >
                      <Icon name={div.icon} className={div.textStr} size="sm" filled />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs sm:text-sm font-bold text-primary truncate">
                          {div.title}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">
                            {div.count} orang
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant/40 px-1.5 py-0.2 rounded-md bg-surface-container-high">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${div.colorStr} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Kegiatan & Workflows (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col justify-between hover:border-outline-variant/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Icon name="event_note" filled />
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary">
                    Agenda Terdekat
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold mt-0.5">
                    Produksi & Kegiatan Studio
                  </p>
                </div>
              </div>
              <Link
                href="/admin/kegiatan"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Lihat Kalender →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingKegiatans.length > 0 ? (
                upcomingKegiatans.map((k) => (
                  <div
                    key={k.id}
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-start justify-between gap-3 hover:border-outline-variant/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-primary truncate">
                        {k.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/60 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="calendar_today" size="sm" className="!text-[10px]" />
                          {new Date(k.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="location_on" size="sm" className="!text-[10px]" />
                          {k.location}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant shrink-0">
                      {k.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-center">
                  <Icon name="event_busy" className="text-on-surface-variant/30 mx-auto mb-2" size="md" />
                  <p className="text-xs text-on-surface-variant/60 font-medium">
                    Belum ada agenda kegiatan yang dijadwalkan.
                  </p>
                  <Link
                    href="/admin/kegiatan"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary/10 text-secondary text-xs font-bold mt-3 hover:bg-secondary/20 transition-all"
                  >
                    <Icon name="add" size="sm" /> Buat Kegiatan
                  </Link>
                </div>
              )}
            </div>

            {/* Direct CMS Studio Links */}
            <div className="mt-6 pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-2">
              <Link
                href="/admin/layout"
                className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/10 text-[11px] font-semibold text-primary hover:border-secondary/40 hover:text-secondary flex items-center gap-2 transition-all"
              >
                <Icon name="view_quilt" size="sm" />
                <span>Layout Landing</span>
              </Link>
              <Link
                href="/admin/galeri"
                className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/10 text-[11px] font-semibold text-primary hover:border-secondary/40 hover:text-secondary flex items-center gap-2 transition-all"
              >
                <Icon name="photo_library" size="sm" />
                <span>Galeri Foto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
