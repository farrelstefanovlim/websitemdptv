"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: {
    track: "w-8 h-4.5 p-0.5",
    thumb: "w-3.5 h-3.5",
    translate: 14,
  },
  md: {
    track: "w-11 h-6 p-0.5",
    thumb: "w-5 h-5",
    translate: 20,
  },
  lg: {
    track: "w-14 h-7.5 p-1",
    thumb: "w-5.5 h-5.5",
    translate: 26,
  },
};

export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className = "",
}: SwitchProps) {
  const cfg = sizeConfig[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`
        inline-flex items-center justify-between gap-3 select-none
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs sm:text-sm font-bold text-primary leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[10px] sm:text-xs text-on-surface-variant/60 mt-0.5 leading-normal">
              {description}
            </span>
          )}
        </div>
      )}

      <div
        role="switch"
        aria-checked={checked}
        className={`
          relative rounded-full transition-colors duration-200 shrink-0 flex items-center
          ${cfg.track}
          ${checked 
            ? "bg-secondary shadow-xs shadow-secondary/30" 
            : "bg-surface-container-highest border border-outline-variant/30"
          }
        `}
      >
        <motion.div
          animate={{ x: checked ? cfg.translate : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`
            ${cfg.thumb} rounded-full bg-white shadow-md
            ${checked ? "shadow-secondary/20" : ""}
          `}
        />
      </div>
    </div>
  );
}
