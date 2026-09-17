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
    "bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary border border-transparent shadow-xs hover:shadow-md hover:shadow-secondary/20",
  secondary:
    "bg-secondary text-on-secondary hover:brightness-110 border border-transparent shadow-xs hover:shadow-md hover:shadow-secondary/25",
  outline:
    "bg-surface-container-lowest text-primary border border-outline-variant/25 hover:bg-surface-container-low hover:border-secondary/50 hover:text-secondary shadow-xs",
  glass:
    "glass-card-premium text-white border border-white/15 hover:bg-white/15 hover:text-white shadow-xs",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-primary border border-transparent",
  subtle:
    "bg-surface-container-low text-primary hover:bg-surface-container-high border border-outline-variant/15",
  danger:
    "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 shadow-xs",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 shadow-xs",
  icon:
    "bg-transparent text-on-surface-variant/70 hover:bg-surface-container-high hover:text-primary rounded-xl border border-transparent",
  none: "",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-8 px-2.5 text-xs font-semibold rounded-lg",
  sm: "h-9 px-3.5 text-xs font-semibold rounded-xl",
  md: "h-10 px-4 text-sm font-semibold rounded-xl",
  lg: "h-12 px-6 text-base font-semibold rounded-xl",
  icon: "h-9 w-9 p-0 rounded-xl flex items-center justify-center shrink-0",
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
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
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
