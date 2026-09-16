"use client";

import React, { useState, useRef, useEffect, SelectHTMLAttributes, useLayoutEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  label?: string;
  error?: string | null;
  helperText?: string;
  placeholder?: string;
  containerClassName?: string;
  searchable?: boolean;
  clearable?: boolean;
  startIcon?: string | ReactNode;
  onChange?: (e: { target: { value: string } }) => void;
}

export default function Select({
  options,
  label,
  error,
  helperText,
  placeholder = "Pilih opsi...",
  className = "",
  containerClassName = "",
  value,
  onChange,
  disabled,
  searchable = false,
  startIcon,
  required,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const isAutoSearchable = searchable !== false && (searchable === true || options.length > 5);

  const updatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isBottomSpace = window.innerHeight - rect.bottom > 260;
      
      setDropdownPos({
        top: isBottomSpace ? rect.bottom + 6 : rect.top - 6 - Math.min(260, options.length * 42 + 60),
        left: rect.left,
        width: Math.max(rect.width, 220),
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
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAutoSearchable) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAutoSearchable]);

  const handleOpenToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      setSearchQuery("");
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    setIsOpen(false);
    setSearchQuery("");
    if (onChange) onChange({ target: { value: optionValue } });
  };

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = isAutoSearchable && searchQuery.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : options;

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          handleOpenToggle();
        }}
        className={`
          w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium
          bg-surface-container-lowest text-primary text-left
          flex items-center justify-between transition-all duration-200
          focus:outline-none focus:ring-4
          ${error 
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900" 
            : "border-outline-variant/20 focus:border-secondary/50 focus:ring-secondary/10 hover:border-outline-variant/40"
          }
          ${disabled ? "opacity-50 cursor-not-allowed bg-surface-container-low" : "cursor-pointer"}
          ${isOpen ? "border-secondary/50 ring-4 ring-secondary/10 bg-surface-container-low" : ""}
          ${className}
        `}
        {...(props as any)}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {startIcon && (
            <span className="text-on-surface-variant/40 shrink-0">
              {typeof startIcon === "string" ? <Icon name={startIcon} size="sm" /> : startIcon}
            </span>
          )}
          {selectedOption?.icon && (
            <Icon name={selectedOption.icon} size="sm" className="text-secondary shrink-0" />
          )}
          <span className={`truncate ${!selectedOption ? "text-on-surface-variant/40 font-normal" : "text-primary font-medium"}`}>
            {selectedOption?.label || placeholder}
          </span>
        </div>

        <div className={`text-on-surface-variant/40 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-secondary" : ""}`}>
          <Icon name="expand_more" size="sm" />
        </div>
      </button>

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

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
              className="z-[99999] bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-2xl max-h-64 overflow-hidden py-1.5 backdrop-blur-xl flex flex-col"
            >
              {isAutoSearchable && (
                <div className="p-2 border-b border-outline-variant/10">
                  <div className="relative flex items-center">
                    <Icon name="search" size="sm" className="absolute left-2.5 text-on-surface-variant/40 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari pilihan..."
                      className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:border-secondary text-primary placeholder:text-on-surface-variant/40"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-2 text-on-surface-variant/40 hover:text-primary transition-colors"
                        title="Hapus pencarian"
                      >
                        <Icon name="close" size="xs" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-y-auto flex-1 p-1 flex flex-col gap-0.5">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-center text-on-surface-variant/40">
                    Tidak ada pilihan ditemukan
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`
                          w-full px-3 py-2 text-xs text-left rounded-xl transition-all flex items-center justify-between gap-2
                          ${isSelected 
                            ? "bg-secondary text-white font-bold shadow-xs shadow-secondary/20" 
                            : "text-primary hover:bg-surface-container-low"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {opt.icon && (
                            <Icon name={opt.icon} size="sm" className={isSelected ? "text-white" : "text-secondary"} />
                          )}
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {isSelected && <Icon name="check" size="sm" className="text-white shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
