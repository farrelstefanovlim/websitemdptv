"use client";

import { useToastStore } from "@/stores/toast.store";
import Icon from "./Icon";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-3 pointer-events-none items-center w-full px-4 sm:max-w-sm sm:px-0">
      {toasts.map((toast) => {
        const typeStyles = {
          success: "bg-green-50 border-green-200 text-green-800",
          error: "bg-red-50 border-red-200 text-red-800",
          info: "bg-blue-50 border-blue-200 text-blue-800",
          warning: "bg-amber-50 border-amber-200 text-amber-800",
        };
        const icons = {
          success: "check_circle",
          error: "error",
          info: "info",
          warning: "warning",
        };
        
        return (
          <div
            key={toast.id}
            className={`w-full relative pointer-events-auto flex items-start sm:items-center gap-3 p-4 pr-12 rounded-2xl border shadow-xl transition-all duration-300 ease-in-out origin-top ${
              toast.isHiding 
                ? "opacity-0 -translate-y-6 scale-95" 
                : "animate-in slide-in-from-top-6 fade-in duration-300"
            } ${typeStyles[toast.type]}`}
            role="alert"
          >
            <Icon 
              name={icons[toast.type]} 
              className={`shrink-0 mt-0.5 sm:mt-0 ${
                toast.type === "success" ? "text-green-500" 
                  : toast.type === "error" ? "text-red-500" 
                  : toast.type === "warning" ? "text-amber-500" 
                  : "text-blue-500"
              }`} 
              filled
            />
            <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute right-3 top-4 sm:top-1/2 sm:-translate-y-1/2 p-1 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
