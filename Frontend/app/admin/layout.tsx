"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";
import { useAuthStore } from "@/stores/auth.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const isHydrated = useHydrated();

  useEffect(() => {
    // Tunggu sampai zustand store berhasil hydrate dari localStorage
    if (!isHydrated) return;

    // Cek apakah user sudah login
    if (!isAuthenticated || !accessToken) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, accessToken, router, isHydrated]);

  // Tampilkan loading saat sedang mengecek auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-secondary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-on-surface-variant text-sm">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={desktopCollapsed}
        onToggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
      />

      {/* Main Content Shell */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300">
        <AdminTopbar
          onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
          isCollapsed={desktopCollapsed}
          onToggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
        />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
