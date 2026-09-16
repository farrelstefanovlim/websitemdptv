"use client";

import React, { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";
import Button from "./Button";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  className?: string;
  bodyClassName?: string;
  headerIcon?: string;
  headerIconClass?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-5xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  showCloseButton = true,
  closeOnOutsideClick = true,
  className = "",
  bodyClassName = "",
  headerIcon,
  headerIconClass = "text-secondary",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOutsideClick ? onClose : undefined}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className={`
              relative w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col
              bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/15
              overflow-hidden z-10 ${className}
            `}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest shrink-0">
                <div className="flex items-center gap-3 pr-2">
                  {headerIcon && (
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <Icon name={headerIcon} className={headerIconClass} size="md" />
                    </div>
                  )}
                  <div>
                    {title && (
                      <h3 className="text-base sm:text-lg font-bold text-primary font-display leading-snug">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-[11px] sm:text-xs text-on-surface-variant/60 mt-0.5 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {showCloseButton && (
                  <Button
                    type="button"
                    variant="icon"
                    size="icon"
                    onClick={onClose}
                    className="shrink-0 -mr-1"
                    aria-label="Tutup Modal"
                  >
                    <Icon name="close" size="sm" />
                  </Button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={`p-5 sm:p-6 overflow-y-auto flex-1 ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 sm:px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/40 flex items-center justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
