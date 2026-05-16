import React, { SelectHTMLAttributes } from "react";
import Icon from "./Icon";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  containerClassName?: string;
}

export default function Select({
  options,
  label,
  className = "",
  containerClassName = "",
  ...props
}: SelectProps) {
  const baseSelectCls = `
    appearance-none w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 
    bg-surface-container-lowest text-sm text-primary 
    focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 
    transition-all disabled:opacity-50 disabled:cursor-not-allowed
    pr-10
  `;

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select className={`${baseSelectCls} ${className}`} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
          <Icon name="expand_more" size="sm" />
        </div>
      </div>
    </div>
  );
}
