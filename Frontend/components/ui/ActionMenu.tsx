import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

export interface ActionMenuItem {
  label?: string;
  icon?: string;
  onClick?: () => void;
  variant?: "default" | "danger" | "success";
  hidden?: boolean;
  active?: boolean;
  type?: "action" | "divider" | "header";
}

export default function ActionMenu({ 
  actions, 
  triggerIcon = "more_vert", 
  title = "Opsi Lainnya",
  className = "" 
}: { 
  actions: ActionMenuItem[]; 
  triggerIcon?: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const items = actions.filter((a) => !a.hidden);
  const actionItemsCount = items.filter((a) => a.type !== "divider" && a.type !== "header").length;
  const isSearchable = actionItemsCount > 5;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && isSearchable) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, isSearchable]);

  if (items.length === 0) return null;

  const handleToggle = () => {
    if (!open) {
      setSearchQuery("");
    }
    setOpen(!open);
  };

  const filteredItems = isSearchable && searchQuery.trim()
    ? items.filter((item) => {
        if (item.type === "divider" || item.type === "header") return false;
        return item.label?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      })
    : items;

  return (
    <div className={`relative shrink-0 ${className}`} ref={ref}>
      <button
        onClick={handleToggle}
        className="h-10 px-3.5 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-primary active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-xs cursor-pointer"
        title={title}
      >
        <Icon name={triggerIcon} size="sm" />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 ${isSearchable ? "w-64 max-h-80" : "w-56"} bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-xl shadow-black/5 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 flex flex-col overflow-hidden`}>
          {isSearchable && (
            <div className="p-2 border-b border-outline-variant/10 shrink-0">
              <div className="relative flex items-center">
                <Icon name="search" size="sm" className="absolute left-2.5 text-on-surface-variant/40 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari opsi..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:border-secondary text-primary placeholder:text-on-surface-variant/40"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 text-on-surface-variant/40 hover:text-primary transition-colors"
                    title="Hapus pencarian"
                  >
                    <Icon name="close" size="xs" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1 py-1">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-4 text-xs text-center text-on-surface-variant/40">
                Tidak ada pilihan ditemukan
              </div>
            ) : (
              filteredItems.map((item, i) => {
                if (item.type === "divider") {
                  return <div key={i} className="my-1.5 h-px bg-outline-variant/15 w-full" />;
                }
                if (item.type === "header") {
                  return (
                    <div key={i} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/40">
                      {item.label}
                    </div>
                  );
                }
                return (
                  <button
                    key={i}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                      item.variant === "danger"
                        ? "text-red-500 hover:bg-red-50"
                        : item.variant === "success"
                        ? "text-green-600 hover:bg-green-50"
                        : "text-primary hover:bg-surface-container-low"
                    } ${item.active ? "bg-surface-container-low" : ""}`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      {item.icon && <Icon name={item.icon} size="sm" className={`opacity-70 shrink-0 ${item.active ? "text-secondary" : ""}`} />}
                      <span className={`font-semibold truncate ${item.active ? "text-secondary" : ""}`}>{item.label}</span>
                    </div>
                    {item.active && <Icon name="check" size="sm" className="text-secondary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
