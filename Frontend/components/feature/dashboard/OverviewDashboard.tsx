"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { dashboardService, DashboardMetrics } from "@/services/dashboard.service";

function StatCard({ title, value, subtitle, icon, colorClass, iconBgClass }: any) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
      
      <div className="flex items-start justify-between mb-4 pl-2">
        <h3 className="text-xs sm:text-sm font-bold text-on-surface-variant">{title}</h3>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
          <Icon name={icon} className={colorClass.replace('bg-', 'text-')} filled />
        </div>
      </div>
      
      <div className="pl-2">
        <p className="text-3xl font-black text-primary">{value}</p>
        {subtitle && <p className="text-[11px] text-on-surface-variant/60 mt-1.5 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function OverviewDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.fetchMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed fetching dashboard metrics:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  // Derived State from API Aggregation
  const totalUsers = metrics.users.reduce((acc, curr) => acc + curr.count, 0);
  const adminCount = metrics.users.find((u: any) => u.role === "admin")?.count || 0;
  const operatorCount = metrics.users.find((u: any) => u.role === "operator")?.count || 0;

  const totalMembers = metrics.members.total;
  const divGraphDesign = metrics.members.byDivision.find((m: any) => m.name === "Graphic Design")?.count || 0;
  const divPhotoVideo = metrics.members.byDivision.find((m: any) => m.name === "Photography & Videography")?.count || 0;
  const divKominfo = metrics.members.byDivision.find((m: any) => m.name === "Kominfo")?.count || 0;
  const divPsdm = metrics.members.byDivision.find((m: any) => m.name === "Pengelola Sumber Daya Manusia")?.count || 0;
  const divHumas = metrics.members.byDivision.find((m: any) => m.name === "Hubungan Masyarakat")?.count || 0;

  const totalApplicants = metrics.applicants.total;
  const acceptedApplicants = metrics.applicants.byStatus.find((f: any) => f.status === "accepted")?.count || 0;

  const totalKegiatan = metrics.kegiatan.total;
  
  // Attendance metrics
  const todayTotal = metrics.attendance.todayTotal;
  const presentCount = metrics.attendance.byStatus.find((r: any) => r.status === "present")?.count || 0;
  const absentCount = metrics.attendance.byStatus.find((r: any) => r.status === "absent")?.count || 0;
  const lateCount = metrics.attendance.byStatus.find((r: any) => r.status === "late")?.count || 0;
  const excusedCount = metrics.attendance.byStatus.find((r: any) => r.status === "excused")?.count || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Anggota" value={totalMembers} subtitle={`${divPhotoVideo} Video, ${divGraphDesign} Design, ${divKominfo} IT, ${divPsdm} PSDM, ${divHumas} Humas`}
          icon="groups" colorClass="bg-blue-500" iconBgClass="bg-blue-500/10"
        />
        <StatCard 
          title="Pelamar Aktif" value={totalApplicants} subtitle={`${acceptedApplicants} pelamar telah diterima`}
          icon="contact_page" colorClass="bg-emerald-500" iconBgClass="bg-emerald-500/10"
        />
        <StatCard 
          title="Kegiatan Terdaftar" value={totalKegiatan} subtitle="Event dalam sistem"
          icon="event" colorClass="bg-purple-500" iconBgClass="bg-purple-500/10"
        />
        <StatCard 
          title="Akses Admin" value={totalUsers} subtitle={`${adminCount} Admin, ${operatorCount} Operator`}
          icon="admin_panel_settings" colorClass="bg-red-500" iconBgClass="bg-red-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Attendance Widget */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col hover:border-outline-variant/30 transition-all">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Icon name="today" filled />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Rekap Absensi</h3>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold mt-0.5">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>
          
          {totalMembers > 0 ? (
            <div className="space-y-6">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-primary">{todayTotal}</span>
                  <span className="text-sm font-semibold text-on-surface-variant/40">/ {totalMembers} hadir</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-green-500/10 text-green-600 border border-green-500/20 text-xs font-bold">
                  {Math.round((todayTotal/totalMembers)*100)}% Response
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-3.5 w-full bg-surface-container-high rounded-full overflow-hidden flex ring-1 ring-inset ring-outline-variant/10">
                  {todayTotal === 0 && <div className="w-full bg-outline-variant/5" />}
                  <div style={{ width: `${(presentCount/totalMembers)*100}%` }} className="bg-green-500" />
                  <div style={{ width: `${(lateCount/totalMembers)*100}%` }} className="bg-yellow-500" />
                  <div style={{ width: `${(excusedCount/totalMembers)*100}%` }} className="bg-blue-500" />
                  <div style={{ width: `${(absentCount/totalMembers)*100}%` }} className="bg-red-500" />
                </div>
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:bg-green-500/5 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Hadir
                  </div>
                  <span className="text-base font-black text-primary">{presentCount}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:bg-yellow-500/5 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Telat
                  </div>
                  <span className="text-base font-black text-primary">{lateCount}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:bg-blue-500/5 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Izin
                  </div>
                  <span className="text-base font-black text-primary">{excusedCount}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:bg-red-500/5 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Alpa
                  </div>
                  <span className="text-base font-black text-primary">{absentCount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-60">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <Icon name="history" className="text-on-surface-variant/50" size="lg" />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">Belum ada aktivitas absensi.</p>
            </div>
          )}
        </div>

        {/* Division Distribution */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col hover:border-outline-variant/30 transition-all">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Icon name="donut_large" filled />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Distribusi Divisi</h3>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-bold mt-0.5">Komposisi anggota aktif</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-2 justify-center flex-1">
            {[
              { id: "pv", title: "Photography & Videography", count: divPhotoVideo, icon: "camera", colorStr: "bg-blue-500", textStr: "text-blue-500", lightBg: "bg-blue-500/10" },
              { id: "gd", title: "Graphic Design", count: divGraphDesign, icon: "brush", colorStr: "bg-pink-500", textStr: "text-pink-500", lightBg: "bg-pink-500/10" },
              { id: "ki", title: "Kominfo", count: divKominfo, icon: "terminal", colorStr: "bg-emerald-500", textStr: "text-emerald-500", lightBg: "bg-emerald-500/10" },
              { id: "psdm", title: "Pengelola Sumber Daya Manusia", count: divPsdm, icon: "badge", colorStr: "bg-amber-500", textStr: "text-amber-500", lightBg: "bg-amber-500/10" },
              { id: "humas", title: "Hubungan Masyarakat", count: divHumas, icon: "campaign", colorStr: "bg-cyan-500", textStr: "text-cyan-500", lightBg: "bg-cyan-500/10" },
            ].map((div) => {
              const percentage = totalMembers > 0 ? Math.round((div.count / totalMembers) * 100) : 0;
              return (
                <div key={div.id} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl ${div.lightBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon name={div.icon} className={div.textStr} size="sm" filled />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-primary truncate">{div.title}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-primary">{div.count}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant/40 px-1.5 py-0.5 rounded-md bg-surface-container-high">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                      <div className={`h-full ${div.colorStr} rounded-full transition-all duration-700 ease-out`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
