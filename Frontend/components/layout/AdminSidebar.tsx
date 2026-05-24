import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "space_dashboard", href: "/admin/dashboard" },
  { id: "layout", label: "Layout Editor", icon: "dashboard_customize", href: "/admin/layout" },
  { id: "absensi", label: "Absensi", icon: "checklist", href: "/admin/absensi" },
  { id: "penerimaan", label: "Penerimaan", icon: "person_add", href: "/admin/penerimaan" },
  { id: "kegiatan", label: "Kegiatan", icon: "event", href: "/admin/kegiatan" },
  { id: "content", label: "Content", icon: "edit_note", href: "/admin/content" },
  { id: "galeri", label: "Galeri", icon: "photo_library", href: "/admin/galeri" },
  { id: "members", label: "Data Anggota", icon: "badge", href: "/admin/members" },
  { id: "users", label: "Users", icon: "manage_accounts", href: "/admin/users" }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const activeNav = navItems.find((item) => pathname.startsWith(item.href) && item.href !== "#")?.id || "layout";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen
          bg-surface-container-lowest border-r border-outline-variant/15
          flex flex-col transition-all duration-300 transform lg:translate-x-0
          ${isCollapsed ? "w-[88px]" : "w-72"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className={`p-6 border-b border-outline-variant/10 flex items-center transition-all overflow-hidden ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Icon name="tv" filled className="text-white" />
          </div>
          <div className={`transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            {!isCollapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-sm font-black tracking-tight text-primary">
                  MDPTV
                </h1>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-medium">
                  Admin Panel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-4 flex flex-col gap-1 overflow-x-hidden overflow-y-auto ${isCollapsed ? "items-center" : ""}`}>
          {!isCollapsed && (
            <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold px-3 mb-2 whitespace-nowrap">
              Menu
            </span>
          )}
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              className={`
                flex items-center rounded-xl text-sm font-medium transition-all duration-200 shrink-0
                ${isCollapsed ? "justify-center w-12 h-12" : "gap-3 px-4 py-3 w-full"}
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
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Action Toggle & Sidebar Footer */}
        <div className="p-4 border-t border-outline-variant/10 flex flex-col gap-2">
          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className={`
              hidden lg:flex items-center rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 shrink-0
              ${isCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-3 w-full"}
            `}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Icon name={isCollapsed ? "chevron_right" : "chevron_left"} />
            {!isCollapsed && <span className="whitespace-nowrap">Collapse</span>}
          </button>
          
          <Link
            href="/"
            title={isCollapsed ? "Back to Site" : undefined}
            className={`
              flex items-center rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 shrink-0
              ${isCollapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4 py-3 w-full"}
            `}
          >
            <Icon name="arrow_back" />
            {!isCollapsed && <span className="whitespace-nowrap">Back to Site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
