"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Icon from "@/components/ui/Icon"
import { usePathname } from "next/navigation"

interface SubNavItem {
  id: string
  label: string
  icon: string
  href: string
}

interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  children?: SubNavItem[]
}

interface NavCategory {
  category: string
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    category: "Utama",
    items: [{ id: "dashboard", label: "Dashboard", icon: "space_dashboard", href: "/admin/dashboard" }],
  },
  {
    category: "Operasional & Anggota",
    items: [
      { id: "members", label: "Data Anggota", icon: "badge", href: "/admin/members" },
      { id: "absensi", label: "Rekap Absensi", icon: "checklist", href: "/admin/absensi" },
      { id: "kas", label: "Uang Kas", icon: "payments", href: "/admin/kas" },
      {
        id: "wawancara",
        label: "Wawancara",
        icon: "quiz",
        href: "/admin/wawancara",
        children: [
          { id: "wawancara-pertanyaan", label: "Pertanyaan", icon: "help_outline", href: "/admin/wawancara/pertanyaan" },
          { id: "wawancara-jawaban", label: "Form Jawaban", icon: "edit_note", href: "/admin/wawancara/jawaban" },
          { id: "wawancara-log", label: "Log Dokumentasi", icon: "folder_shared", href: "/admin/wawancara/log" },
        ],
      },
      { id: "penerimaan", label: "Penerimaan", icon: "person_add", href: "/admin/penerimaan" },
      { id: "kegiatan", label: "Kegiatan & Event", icon: "event", href: "/admin/kegiatan" },
    ],
  },
  {
    category: "CMS & Media",
    items: [
      { id: "layout", label: "Layout Editor", icon: "dashboard_customize", href: "/admin/layout" },
      { id: "content", label: "Konten Landing", icon: "edit_note", href: "/admin/content" },
      { id: "galeri", label: "Galeri Foto", icon: "photo_library", href: "/admin/galeri" },
    ],
  },
  {
    category: "Sistem & Akses",
    items: [{ id: "users", label: "Manajemen User", icon: "manage_accounts", href: "/admin/users" }],
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse?: () => void
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname()

  // State untuk melacak menu mana yang terbuka (expanded)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    wawancara: pathname.startsWith("/admin/wawancara"),
  })

  const toggleExpand = (menuId: string) => {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }))
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar Shell */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen
          bg-surface-container-lowest border-r border-outline-variant/15
          flex flex-col transition-all duration-300 transform lg:translate-x-0 shrink-0
          ${isCollapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Continuous Logo Header */}
        <div className={`h-16 px-4 border-b border-outline-variant/15 flex items-center transition-all shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <Image src="/logo-mdptv.png" alt="MDPTV Logo" width={36} height={36} className="w-full h-full object-contain drop-shadow-xs" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight text-primary font-display leading-tight truncate">MDPTV</h1>
                <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-bold truncate">Studio Admin</p>
              </div>
            )}
          </Link>
        </div>

        {/* Categorized Navigation */}
        <nav className={`flex-1 p-3 flex flex-col gap-4 overflow-x-hidden overflow-y-auto hide-scrollbar ${isCollapsed ? "items-center" : ""}`}>
          {navCategories.map((group, groupIdx) => (
            <div key={group.category} className="w-full flex flex-col gap-1">
              {/* Category Header or Divider */}
              {!isCollapsed ? <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold px-3 pt-1 pb-1 whitespace-nowrap block">{group.category}</span> : groupIdx > 0 && <div className="w-8 h-[1px] bg-outline-variant/15 my-1.5 mx-auto" />}

              {/* Items in this Category */}
              {group.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0
                const isParentActive = pathname.startsWith(item.href)
                const isExpanded = expandedMenus[item.id] || isParentActive

                if (hasChildren && !isCollapsed) {
                  return (
                    <div key={item.id} className="w-full flex flex-col gap-1">
                      {/* Parent Item with Dropdown Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className={`
                          w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                          ${isParentActive ? "bg-secondary/10 text-secondary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"}
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon name={item.icon} filled={isParentActive} size="sm" className={isParentActive ? "text-secondary" : "text-on-surface-variant/70"} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <Icon name={isExpanded ? "expand_less" : "expand_more"} size="sm" className="text-on-surface-variant/50" />
                      </button>

                      {/* Dropdown Children */}
                      {isExpanded && (
                        <div className="ml-4 pl-3 border-l-2 border-outline-variant/15 flex flex-col gap-1 my-0.5">
                          {item.children?.map((child) => {
                            const isChildActive = pathname === child.href
                            return (
                              <Link
                                key={child.id}
                                href={child.href}
                                onClick={onClose}
                                className={`
                                  flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                                  ${isChildActive ? "bg-secondary text-white shadow-sm shadow-secondary/30" : "text-on-surface-variant/80 hover:bg-surface-container-low hover:text-primary"}
                                `}
                              >
                                <Icon name={child.icon} size="sm" className={isChildActive ? "text-white" : "text-on-surface-variant/60"} />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }

                // Normal single item
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin/dashboard")

                return (
                  <Link
                    key={item.id}
                    href={hasChildren ? item.children![0].href : item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      flex items-center rounded-xl text-xs font-semibold transition-all duration-200 shrink-0
                      ${isCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3.5 py-2.5 w-full"}
                      ${isActive ? "bg-secondary text-white shadow-sm shadow-secondary/30" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"}
                    `}
                  >
                    <Icon name={item.icon} filled={isActive} size="sm" className={isActive ? "text-white" : "text-on-surface-variant/70"} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
