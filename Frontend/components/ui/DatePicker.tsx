"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, InputHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { motion, AnimatePresence } from "framer-motion";

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string;
  containerClassName?: string;
  value?: string;
  onChange?: (e: any) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  label,
  className = "",
  containerClassName = "",
  value,
  onChange,
  disabled,
  ...props
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Currently viewed month/year in the calendar
  const [viewDate, setViewDate] = useState(() => {
    if (typeof value === "string" && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const parsedValue = typeof value === "string" && value ? new Date(value) : null;

  const updatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popupHeight = 350; // approximate height of the calendar popup
      const isBottomSpace = window.innerHeight - rect.bottom > popupHeight;
      
      const desiredWidth = Math.max(300, rect.width);
      let newLeft = rect.left;

      // Prevent X-overflow on mobile devices
      if (newLeft + desiredWidth > window.innerWidth - 16) {
        newLeft = window.innerWidth - desiredWidth - 16;
      }
      if (newLeft < 16) {
        newLeft = 16;
      }
      
      setDropdownPos({
        top: isBottomSpace ? rect.bottom + 8 : rect.top - 8 - popupHeight,
        left: newLeft,
        width: desiredWidth,
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
  }, [isOpen]);

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

  const handleDateSelect = (d: Date) => {
    setIsOpen(false);
    if (onChange) {
      // format as YYYY-MM-DD
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      onChange({ target: { value: `${y}-${m}-${day}` } });
    }
  };

  // Calendar logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // Format display value
  const displayValue = parsedValue 
    ? `${parsedValue.getDate()} ${MONTH_NAMES[parsedValue.getMonth()].slice(0, 3)} ${parsedValue.getFullYear()}`
    : "Pilih tanggal...";

  const baseInputCls = `
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
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen && parsedValue) setViewDate(parsedValue);
          }
        }}
        className={`${baseInputCls} ${className}`}
        {...(props as any)}
      >
        <span className="truncate pr-4 leading-none">{displayValue}</span>
        <div className={`text-on-surface-variant/40 transition-colors duration-300 ${isOpen ? "text-secondary" : ""}`}>
          <Icon name="calendar_today" size="sm" />
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
              className="z-[99999] bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-2xl overflow-hidden p-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handlePrevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                  <Icon name="chevron_left" size="sm" />
                </button>
                <div className="text-sm font-bold text-primary">
                  {MONTH_NAMES[month]} {year}
                </div>
                <button type="button" onClick={handleNextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                  <Icon name="chevron_right" size="sm" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-on-surface-variant/50 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Previous month trailing days */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`prev-${i}`} className="h-8 flex items-center justify-center text-xs text-on-surface-variant/20">
                    {daysInPrevMonth - firstDayOfMonth + i + 1}
                  </div>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = i + 1;
                  const isSelected = parsedValue?.getDate() === date && parsedValue?.getMonth() === month && parsedValue?.getFullYear() === year;
                  const today = new Date();
                  const isToday = today.getDate() === date && today.getMonth() === month && today.getFullYear() === year;

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => handleDateSelect(new Date(year, month, date))}
                      className={`
                        h-8 rounded-lg flex items-center justify-center text-xs transition-all relative
                        ${isSelected 
                          ? "bg-secondary text-white font-bold shadow-md shadow-secondary/20 scale-105" 
                          : "text-primary hover:bg-surface-container-low hover:font-bold"
                        }
                        ${!isSelected && isToday ? "text-secondary font-bold" : ""}
                      `}
                    >
                      {date}
                      {!isSelected && isToday && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-secondary" />
                      )}
                    </button>
                  );
                })}

                {/* Next month leading days */}
                {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
                  <div key={`next-${i}`} className="h-8 flex items-center justify-center text-xs text-on-surface-variant/20">
                    {i + 1}
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
