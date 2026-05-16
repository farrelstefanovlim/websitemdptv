import Icon from "@/components/ui/Icon";

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

export default function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 px-4 py-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleSidebar(); } }}
        onClick={onToggleSidebar}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 select-none"
      >
        <Icon name="menu" />
      </div>
    </div>
  );
}
