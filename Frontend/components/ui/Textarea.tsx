"use client";

import React, { forwardRef, TextareaHTMLAttributes, ReactNode } from "react";
import Icon from "./Icon";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  containerClassName?: string;
  showCount?: boolean;
  labelAction?: ReactNode;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = "",
      className = "",
      disabled,
      required,
      id,
      rows = 3,
      maxLength,
      value,
      showCount = false,
      labelAction,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className={`w-full ${containerClassName}`}>
        {(label || labelAction || showCount) && (
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
            <div className="flex items-center gap-2 ml-auto">
              {showCount && maxLength && (
                <span className="text-[10px] text-on-surface-variant/40 font-medium">
                  {currentLength} / {maxLength}
                </span>
              )}
              {labelAction}
            </div>
          </div>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface-container-lowest text-primary font-medium
            border transition-all duration-200 resize-none
            placeholder:text-on-surface-variant/30
            focus:outline-none focus:ring-4
            ${error 
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900" 
              : "border-outline-variant/20 focus:border-secondary/50 focus:ring-secondary/10 hover:border-outline-variant/40"
            }
            ${disabled ? "opacity-50 cursor-not-allowed bg-surface-container-low" : ""}
            ${className}
          `}
          {...props}
        />

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

Textarea.displayName = "Textarea";

export default Textarea;
