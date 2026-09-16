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

export default function PengumumanPage() {
  const [data, setData] = useState<AnnouncementResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruitmentService.getAnnouncement()
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setData({ isOpen: false });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const groupedByDivision = useMemo(() => {
    if (!data?.accepted) return {};
    const groups: Record<string, AcceptedApplicant[]> = {};
    data.accepted.forEach((app) => {
      if (!groups[app.divisionName]) groups[app.divisionName] = [];
      groups[app.divisionName].push(app);
    });
    return groups;
  }, [data]);

  return (
    <div className="min-h-screen bg-background text-on-surface relative flex flex-col">
      <div className="fixed inset-0 noise-bg z-0 pointer-events-none" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-15 pointer-events-none" />

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-[80px] h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <Icon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Kembali</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Icon name="settings_input_component" size="sm" />
            </div>
            <span className="text-xl font-black tracking-tighter font-display text-primary">MDPTV</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col pt-12 pb-24 px-4 sm:px-6 md:px-[80px]">
        {loading ? (
          <div className="m-auto flex flex-col items-center justify-center gap-4 py-32">
            <div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            <p className="text-on-surface-variant font-medium tracking-wide">Memuat Data...</p>
          </div>
        ) : (
          <div className="max-w-[800px] w-full mx-auto">
            {!data?.isOpen ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-light rounded-3xl p-12 sm:p-20 shadow-sm border border-outline-variant/30 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <Icon name="lock" filled className="text-red-500 !text-5xl" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-primary mb-4 tracking-tight font-display">
                  Pengumuman Ditutup
                </h1>
                <p className="text-on-surface-variant/80 text-lg sm:text-xl max-w-lg mb-8 leading-relaxed">
                  Hasil seleksi rekrutmen MDPTV belum dipublikasikan saat ini. Harap mengecek kembali nanti secara berkala.
                </p>
                <Link href="/" className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold tracking-wide hover:bg-secondary transition-all">
                  Kembali ke Beranda
                </Link>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <span className="w-8 h-px bg-secondary" />
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-secondary font-bold">
                      Resmi
                    </span>
                    <span className="w-8 h-px bg-secondary" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 tracking-tight font-display">
                    Anggota Baru
                  </h1>
                  <p className="text-on-surface-variant/80 text-lg leading-relaxed max-w-xl mx-auto">
                    Selamat kepada calon-calon tim yang telah lolos seleksi bergabung dengan UKM MDPTV! Berikut adalah hasilnya:
                  </p>
                </div>

                {Object.keys(groupedByDivision).length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-on-surface-variant/50 text-xl font-medium">Belum ada peserta yang diterima.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {Object.entries(groupedByDivision).map(([division, apps], idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={division} 
                        className="glass-card-light rounded-3xl border border-outline-variant/30 overflow-hidden"
                      >
                        <div className="bg-primary px-6 py-4 flex items-center justify-between">
                          <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider">{division}</h2>
                          <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">{apps.length} ORANG</div>
                        </div>
                        <div className="divide-y divide-outline-variant/10">
                          {apps.map((app, appIdx) => (
                            <div key={appIdx} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors">
                              <span className="font-bold text-primary truncate sm:text-lg">{app.name}</span>
                              <span className="font-mono text-secondary tracking-widest text-sm bg-secondary/10 px-3 py-1 rounded-lg shrink-0">{app.npm}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-16 text-center">
                  <p className="text-sm font-medium text-on-surface-variant/60 italic">
                    Anggota yang diterima akan dihubungi lebih lanjut melalui Grup WhatsApp / Kontak yang tersedia.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
