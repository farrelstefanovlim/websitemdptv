"use client";

import React, { ReactNode } from "react";
import Icon from "./Icon";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "glass"
  | "surface";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
  icon?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-secondary/10 text-secondary border border-secondary/20",
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary text-white",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-rose-50 text-rose-700 border border-rose-200",
  neutral: "bg-surface-container-high text-on-surface-variant/80 border border-outline-variant/20",
  glass: "glass-card text-white/80 border-white/20",
  surface: "bg-surface-container-high text-primary/70 border border-outline-variant/30",
};

const defaultDotColors: Record<BadgeVariant, string> = {
  default: "bg-secondary",
  primary: "bg-white",
  secondary: "bg-white",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  neutral: "bg-on-surface-variant/60",
  glass: "bg-white/80",
  surface: "bg-primary/50",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[9px] gap-1.5",
  md: "px-3 py-1 text-[10px] gap-2",
  lg: "px-3.5 py-1.5 text-xs gap-2",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  dotColor,
  icon,
  className = "",
}: BadgeProps) {
  const effectiveDotColor = dotColor || defaultDotColors[variant];

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-bold uppercase tracking-wider select-none shrink-0
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${effectiveDotColor}`} />}
      {icon && <Icon name={icon} size="xs" className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
