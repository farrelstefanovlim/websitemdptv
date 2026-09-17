"use client";

import React, { useState, forwardRef, InputHTMLAttributes, ReactNode } from "react";
import Icon from "./Icon";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string | null;
  helperText?: string;
  startIcon?: string | ReactNode;
  endIcon?: string | ReactNode;
  isPassword?: boolean;
  inputSize?: "sm" | "md" | "lg";
  containerClassName?: string;
  labelAction?: ReactNode;
}

const sizeClasses = {
  sm: "px-3 py-2 text-xs rounded-xl",
  md: "px-3.5 py-2.5 text-sm rounded-xl",
  lg: "px-4 py-3.5 text-sm rounded-2xl",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      isPassword = false,
      inputSize = "md",
      containerClassName = "",
      className = "",
      type = "text",
      disabled,
      required,
      id,
      labelAction,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`w-full ${containerClassName}`}>
        {(label || labelAction) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <label
                htmlFor={inputId}
                className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block"
              >
                {label}
                {required && <span className="text-rose-500 ml-0.5">*</span>}
              </label>
            )}
            {labelAction}
          </div>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-on-surface-variant/40 pointer-events-none">
              {typeof startIcon === "string" ? <Icon name={startIcon} size="sm" /> : startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            disabled={disabled}
            required={required}
            className={`
              w-full bg-surface-container-lowest text-primary font-medium
              border transition-all duration-200
              placeholder:text-on-surface-variant/30
              focus:outline-none focus:ring-4
              ${error 
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900" 
                : "border-outline-variant/20 focus:border-secondary/50 focus:ring-secondary/10 hover:border-outline-variant/40"
              }
              ${disabled ? "opacity-50 cursor-not-allowed bg-surface-container-low" : ""}
              ${startIcon ? "pl-10" : ""}
              ${isPassword || endIcon ? "pr-10" : ""}
              ${sizeClasses[inputSize]}
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 flex items-center justify-center text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} size="sm" />
            </button>
          )}

          {!isPassword && endIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-on-surface-variant/40 pointer-events-none">
              {typeof endIcon === "string" ? <Icon name={endIcon} size="sm" /> : endIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
            <Icon name="error" size="xs" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
