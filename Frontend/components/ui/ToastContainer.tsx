"use client";

import { useToastStore } from "@/stores/toast.store";
import Icon from "./Icon";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed top-5 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none items-end w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const typeStyles = {
            success: "bg-emerald-50 border-emerald-200 text-emerald-950",
            error: "bg-rose-50 border-rose-200 text-rose-950",
            info: "bg-secondary/10 border-secondary/20 text-primary",
            warning: "bg-amber-50 border-amber-200 text-amber-950",
          };
          const icons = {
            success: "check_circle",
            error: "error",
            info: "info",
            warning: "warning",
          };
          const iconColors = {
            success: "text-emerald-500",
            error: "text-rose-500",
            info: "text-secondary",
            warning: "text-amber-500",
          };

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className={`w-full relative pointer-events-auto flex items-start sm:items-center gap-3 p-4 pr-11 rounded-2xl border shadow-xl backdrop-blur-md ${typeStyles[toast.type]}`}
              role="alert"
            >
              <Icon
                name={icons[toast.type]}
                className={`shrink-0 mt-0.5 sm:mt-0 ${iconColors[toast.type]}`}
                size="sm"
                filled
              />
              <p className="text-xs sm:text-sm font-semibold leading-relaxed flex-1">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="absolute right-2.5 top-3 sm:top-1/2 sm:-translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <Icon name="close" size="xs" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
