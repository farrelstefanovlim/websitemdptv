"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth.store";

interface AdminTopbarProps {
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminTopbar({
  onToggleSidebar,
  isCollapsed,
  onToggleCollapse,
}: AdminTopbarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    router.replace("/login");
  };

  const username = user?.username || "Admin";
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/15 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
      {/* ── Left: Controls & Page Title Portal ────────────────── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka Menu Navigasi"
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all shrink-0 border border-outline-variant/15 bg-surface-container-lowest"
        >
          <Icon name="menu" size="sm" />
        </button>

        {/* Desktop Sidebar Toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
            className="hidden lg:flex w-9 h-9 rounded-xl items-center justify-center text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-low transition-all shrink-0 border border-outline-variant/15 bg-surface-container-lowest"
            title={isCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
          >
            <Icon name={isCollapsed ? "menu_open" : "menu"} size="sm" />
          </button>
        )}

        {/* Dynamic Page Title Slot (Portaled from each page) */}
        <div id="mobile-topbar-title" className="min-w-0 flex-1 flex flex-col justify-center"></div>
      </div>

      {/* ── Right: Page Actions Slot & User Profile ───────────── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dynamic Page Action Buttons Slot */}
        <div id="mobile-topbar-actions" className="flex items-center gap-1.5 sm:gap-2 shrink-0"></div>

        <div className="h-5 w-[1px] bg-outline-variant/15 hidden sm:block mx-1" />

        {/* System Online Status Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/10 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>

        {/* User Profile Chip & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-outline-variant/15 hover:border-secondary/30 bg-surface-container-lowest hover:bg-surface-container-low transition-all"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-lg bg-secondary text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <span className="block text-xs font-bold text-primary truncate leading-tight">
                {username}
              </span>
              <span className="block text-[9px] text-on-surface-variant/50 font-semibold uppercase tracking-wider leading-tight">
                {user?.role || "admin"}
              </span>
            </div>
            <Icon
              name={profileMenuOpen ? "expand_less" : "expand_more"}
              size="sm"
              className="text-on-surface-variant/40 hidden sm:block !text-sm"
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/15 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-xs font-bold text-primary truncate">{username}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20">
                  {user?.role || "admin"}
                </span>
              </div>

              <div className="p-1">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all"
                >
                  <Icon name="open_in_new" size="sm" className="!text-sm text-on-surface-variant/50" />
                  <span>Lihat Web Publik</span>
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error/10 transition-all text-left"
                >
                  <Icon name="logout" size="sm" className="!text-sm text-error/70" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
