import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

const navCategories: NavCategory[] = [
  {
    category: "Utama",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "space_dashboard", href: "/admin/dashboard" },
    ],
  },
  {
    category: "Operasional & Anggota",
    items: [
      { id: "members", label: "Data Anggota", icon: "badge", href: "/admin/members" },
      { id: "absensi", label: "Rekap Absensi", icon: "checklist", href: "/admin/absensi" },
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
    items: [
      { id: "users", label: "Manajemen User", icon: "manage_accounts", href: "/admin/users" },
    ],
  },
];

const allNavItems = navCategories.flatMap((cat) => cat.items);

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const activeNav =
    allNavItems.find(
      (item) => pathname.startsWith(item.href) && item.href !== "#"
    )?.id || "dashboard";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

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
        {/* Continuous Logo Header (Exactly h-16 to unite with Navbar) */}
        <div
          className={`h-16 px-4 border-b border-outline-variant/15 flex items-center transition-all shrink-0 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-sm shadow-secondary/20">
              <Icon name="tv" filled className="text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight text-primary font-display leading-tight truncate">
                  MDPTV
                </h1>
                <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-bold truncate">
                  Studio Admin
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Categorized Navigation */}
        <nav
          className={`flex-1 p-3 flex flex-col gap-4 overflow-x-hidden overflow-y-auto hide-scrollbar ${
            isCollapsed ? "items-center" : ""
          }`}
        >
          {navCategories.map((group, groupIdx) => (
            <div key={group.category} className="w-full flex flex-col gap-1">
              {/* Category Header or Divider */}
              {!isCollapsed ? (
                <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold px-3 pt-1 pb-1 whitespace-nowrap block">
                  {group.category}
                </span>
              ) : (
                groupIdx > 0 && (
                  <div className="w-8 h-[1px] bg-outline-variant/15 my-1.5 mx-auto" />
                )
              )}

              {/* Items in this Category */}
              {group.items.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      flex items-center rounded-xl text-xs font-semibold transition-all duration-200 shrink-0
                      ${
                        isCollapsed
                          ? "justify-center w-11 h-11 mx-auto"
                          : "gap-3 px-3.5 py-2.5 w-full"
                      }
                      ${
                        isActive
                          ? "bg-secondary text-white shadow-sm shadow-secondary/30"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      }
                    `}
                  >
                    <Icon
                      name={item.icon}
                      filled={isActive}
                      size="sm"
                      className={
                        isActive ? "text-white" : "text-on-surface-variant/70"
                      }
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
