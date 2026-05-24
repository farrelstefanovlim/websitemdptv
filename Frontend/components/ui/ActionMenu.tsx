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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = actions.filter((a) => !a.hidden);
  if (items.length === 0) return null;

  return (
    <div className={`relative shrink-0 ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-full min-h-[46px] px-3 sm:px-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-primary active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm"
        title={title}
      >
        <Icon name={triggerIcon} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-xl shadow-black/5 z-50 py-2 animate-in fade-in slide-in-from-top-2">
          {items.map((item, i) => {
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
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                  item.variant === "danger"
                    ? "text-red-500 hover:bg-red-50"
                    : item.variant === "success"
                    ? "text-green-600 hover:bg-green-50"
                    : "text-primary hover:bg-surface-container-low"
                } ${item.active ? "bg-surface-container-low" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <Icon name={item.icon} size="sm" className={`opacity-70 ${item.active ? "text-secondary" : ""}`} />}
                  <span className={`font-semibold ${item.active ? "text-secondary" : ""}`}>{item.label}</span>
                </div>
                {item.active && <Icon name="check" size="sm" className="text-secondary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
