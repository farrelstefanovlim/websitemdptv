import Icon from "@/components/ui/Icon";

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

export default function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  return (
    <div className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 px-4 py-3 flex items-center justify-between gap-3 h-[68px]">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Menu Toggle */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleSidebar(); } }}
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 shrink-0 select-none border border-outline-variant/10 bg-surface-container-lowest/50"
        >
          <Icon name="menu" />
        </div>

        {/* Portal Target for Title */}
        <div id="mobile-topbar-title" className="flex-1 min-w-0 flex flex-col justify-center"></div>
      </div>

      {/* Portal Target for Page Actions on Mobile/Tablet */}
      <div id="mobile-topbar-actions" className="flex items-center gap-1.5 sm:gap-2 shrink-0"></div>
    </div>
  );
}
