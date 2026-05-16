"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const navItems = [
  { id: "layout", label: "Layout Editor", icon: "dashboard_customize", href: "/admin/dashboard" },
  { id: "absensi", label: "Absensi", icon: "checklist", href: "/admin/absensi" },
  { id: "penerimaan", label: "Penerimaan", icon: "person_add", href: "/admin/penerimaan" },
  { id: "kegiatan", label: "Kegiatan", icon: "event", href: "/admin/kegiatan" },
  { id: "content", label: "Content", icon: "edit_note", href: "/admin/content" },
  { id: "galeri", label: "Galeri", icon: "photo_library", href: "/admin/galeri" },
  { id: "users", label: "Users", icon: "manage_accounts", href: "/admin/users" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const activeNav = navItems.find((item) => pathname.startsWith(item.href) && item.href !== "#")?.id || "layout";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72
          bg-surface-container-lowest border-r border-outline-variant/15
          flex flex-col transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Icon name="tv" filled className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-primary">
                MDPTV
              </h1>
              <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-medium">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold px-3 mb-2">
            Menu
          </span>
          {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full
                  ${
                    activeNav === item.id
                      ? "bg-secondary/10 text-secondary border border-secondary/15"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  }
                `}
              >
                <Icon
                  name={item.icon}
                  filled={activeNav === item.id}
                  className={activeNav === item.id ? "text-secondary" : ""}
                />
                <span>{item.label}</span>
              </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-outline-variant/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200"
          >
            <Icon name="arrow_back" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            <Icon name="menu" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
