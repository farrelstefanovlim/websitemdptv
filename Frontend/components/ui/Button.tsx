"use client";

import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "glass"
  | "ghost"
  | "danger"
  | "success"
  | "subtle"
  | "icon"
  | "none";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "none";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary border-b-4 border-black/15 hover:border-secondary-container hover:shadow-lg hover:shadow-secondary/10",
  secondary:
    "bg-secondary text-on-secondary hover:brightness-110 hover:scale-[1.02] border-b-4 border-black/30 hover:shadow-lg hover:shadow-secondary/20",
  outline:
    "bg-white/80 backdrop-blur-xs text-primary border border-outline-variant/25 border-b-4 border-gray-200/80 hover:bg-secondary hover:text-on-secondary hover:border-secondary hover:shadow-lg hover:shadow-secondary/10",
  glass:
    "glass-card-premium text-white border-b-4 border-white/8 hover:bg-white/12 hover:text-white",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
  subtle:
    "bg-surface-container-low text-primary hover:bg-surface-container-high border border-outline-variant/15",
  danger:
    "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 hover:border-rose-300",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300",
  icon:
    "bg-transparent text-on-surface-variant/60 hover:bg-surface-container-high hover:text-primary rounded-xl",
  none: "",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-[11px] rounded-lg",
  sm: "px-4 py-2 text-xs rounded-xl",
  md: "px-6 py-3 text-sm rounded-2xl",
  lg: "px-8 py-4 text-base rounded-2xl",
  icon: "w-9 h-9 p-0 rounded-xl flex items-center justify-center shrink-0",
  none: "",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      startIcon,
      endIcon,
      icon,
      fullWidth = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = size === "icon" || variant === "icon";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          ${isIconOnly ? "" : "font-bold uppercase tracking-wider"}
          transition-all duration-200 ease-out active:scale-95 select-none
          ${disabled || isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
          ${fullWidth ? "w-full" : ""}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <>
            {startIcon && <span className="shrink-0">{startIcon}</span>}
            {children}
            {icon && <span className="shrink-0">{icon}</span>}
            {endIcon && <span className="shrink-0">{endIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
