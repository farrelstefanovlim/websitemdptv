import React, { useState, useRef, useEffect, SelectHTMLAttributes, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  label?: string;
  containerClassName?: string;
  onChange?: (e: any) => void;
}

export default function Select({
  options,
  label,
  className = "",
  containerClassName = "",
  value,
  onChange,
  disabled,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isBottomSpace = window.innerHeight - rect.bottom > 250;
      
      setDropdownPos({
        top: isBottomSpace ? rect.bottom + 8 : rect.top - 8 - Math.min(250, options.length * 45 + 16),
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && 
          buttonRef.current && !buttonRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setIsOpen(false);
    if (onChange) onChange({ target: { value: optionValue } });
  };

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const baseSelectCls = `
    w-full px-3 py-2.5 rounded-xl border border-outline-variant/20 
    bg-surface-container-lowest text-sm text-primary font-medium
    focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 
    transition-all text-left flex items-center justify-between hover:border-outline-variant/40 shadow-sm
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${isOpen ? "border-secondary/40 ring-2 ring-secondary/10 bg-surface-container-low" : ""}
  `;

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`${baseSelectCls} ${className}`}
        {...(props as any)}
      >
        <span className="truncate pr-4">{selectedOption?.label || "Select..."}</span>
        <div className={`text-on-surface-variant/40 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
          <Icon name="expand_more" size="sm" />
        </div>
      </button>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
              className="z-[99999] bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-2xl max-h-60 overflow-y-auto py-2 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-0.5 px-1.5">
                {options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      px-3 py-2.5 text-sm cursor-pointer transition-all rounded-lg flex items-center
                      ${opt.value === value 
                        ? "bg-secondary text-white font-semibold shadow-md shadow-secondary/20 scale-[0.98]" 
                        : "text-primary hover:bg-surface-container-low"}
                    `}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
