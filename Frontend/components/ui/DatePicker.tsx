"use client"

import React, { useState, useRef, useEffect, useLayoutEffect, InputHTMLAttributes, ReactNode } from "react"
import { createPortal } from "react-dom"
import Icon from "./Icon"
import { motion, AnimatePresence } from "framer-motion"

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string
  error?: string | null
  helperText?: string
  containerClassName?: string
  value?: string
  clearable?: boolean
  startIcon?: string | ReactNode
  showChevron?: boolean
  formatDisplay?: (date: Date) => string
  onChange?: (e: { target: { value: string } }) => void
}

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function parseDateSafe(val?: string): Date | null {
  if (!val || typeof val !== "string") return null
  const parts = val.split("-")
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const d = parseInt(parts[2], 10)
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d)
    }
  }
  const d = new Date(val)
  return !isNaN(d.getTime()) ? d : null
}

export default function DatePicker({ label, error, helperText, className = "", containerClassName = "", value, onChange, disabled, clearable = true, startIcon, showChevron = true, formatDisplay, required, placeholder = "Pilih tanggal...", ...props }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  const parsedValue = parseDateSafe(value)

  // Currently viewed month/year in the calendar
  const [viewDate, setViewDate] = useState<Date>(() => {
    return parseDateSafe(value) || new Date()
  })

  const updatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect()
      const popupHeight = 360
      const isBottomSpace = window.innerHeight - rect.bottom > popupHeight

      const desiredWidth = Math.max(300, rect.width)
      let newLeft = rect.left

      if (newLeft + desiredWidth > window.innerWidth - 16) {
        newLeft = window.innerWidth - desiredWidth - 16
      }
      if (newLeft < 16) {
        newLeft = 16
      }

      setDropdownPos({
        top: isBottomSpace ? rect.bottom + 6 : rect.top - 6 - popupHeight,
        left: newLeft,
        width: desiredWidth,
      })
    }
  }

  useLayoutEffect(() => {
    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDateSelect = (d: Date) => {
    setIsOpen(false)
    if (onChange) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      onChange({ target: { value: `${y}-${m}-${day}` } })
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onChange) onChange({ target: { value: "" } })
  }

  // Calendar logic
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(year, month + 1, 1))
  }

  // Format display value
  const displayValue = parsedValue && !isNaN(parsedValue.getTime()) ? (formatDisplay ? formatDisplay(parsedValue) : `${parsedValue.getDate()} ${MONTH_NAMES[parsedValue.getMonth()]} ${parsedValue.getFullYear()}`) : ""

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
          e.preventDefault()
          if (!disabled) {
            setIsOpen(!isOpen)
            if (!isOpen && parsedValue && !isNaN(parsedValue.getTime())) {
              setViewDate(parsedValue)
            }
          }
        }}
        className={`
          w-full px-3 py-2 rounded-xl border text-sm font-medium
          bg-surface-container-lowest text-primary text-left
          flex items-center justify-between transition-all duration-200
          focus:outline-none focus:ring-4
          ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900" : "border-outline-variant/20 focus:border-secondary/50 focus:ring-secondary/10 hover:border-outline-variant/40"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-surface-container-low" : "cursor-pointer"}
          ${isOpen ? "border-secondary/50 ring-4 ring-secondary/10 bg-surface-container-low" : ""}
          ${className}
        `}
        {...(props as any)}
      >
        <div className="flex items-center gap-2 truncate pr-1 flex-1 min-w-0">
          <span className="text-secondary/70 shrink-0">{typeof startIcon === "string" ? <Icon name={startIcon} size="sm" /> : startIcon ? startIcon : <Icon name="calendar_today" size="sm" />}</span>
          <span className={`truncate text-xs ${!displayValue ? "text-on-surface-variant/40 font-normal" : "text-primary font-bold"}`}>{displayValue || placeholder}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {clearable && value && !disabled && (
            <div onClick={handleClear} className="w-5 h-5 rounded-md hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant/40 hover:text-rose-500 transition-colors" title="Hapus Tanggal">
              <Icon name="close" size="xs" />
            </div>
          )}
          {showChevron && (
            <div className={`text-on-surface-variant/40 transition-colors duration-200 ${isOpen ? "text-secondary" : ""}`}>
              <Icon name="expand_more" size="sm" className={isOpen ? "rotate-180" : ""} />
            </div>
          )}
        </div>
      </button>

      {error && (
        <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
          <Icon name="error" size="xs" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && <p className="text-[10px] text-on-surface-variant/50 mt-1 leading-normal">{helperText}</p>}

      {typeof window !== "undefined" &&
        createPortal(
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
                className="z-[99999] bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-2xl overflow-hidden p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={handlePrevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                    <Icon name="chevron_left" size="sm" />
                  </button>
                  <div className="text-xs font-bold text-primary">
                    {MONTH_NAMES[month]} {year}
                  </div>
                  <button type="button" onClick={handleNextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                    <Icon name="chevron_right" size="sm" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2 border-b border-outline-variant/10 pb-1">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider py-0.5">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`prev-${i}`} className="h-7.5 flex items-center justify-center text-xs text-on-surface-variant/20">
                      {daysInPrevMonth - firstDayOfMonth + i + 1}
                    </div>
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = i + 1
                    const isSelected = parsedValue && !isNaN(parsedValue.getTime()) && parsedValue.getDate() === date && parsedValue.getMonth() === month && parsedValue.getFullYear() === year

                    const today = new Date()
                    const isToday = today.getDate() === date && today.getMonth() === month && today.getFullYear() === year

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleDateSelect(new Date(year, month, date))}
                        className={`
                        h-7.5 rounded-lg flex items-center justify-center text-xs transition-all relative font-medium
                        ${isSelected ? "bg-secondary text-white font-bold shadow-xs shadow-secondary/30 scale-105" : "text-primary hover:bg-surface-container-low hover:font-bold"}
                        ${!isSelected && isToday ? "text-secondary font-bold" : ""}
                      `}
                      >
                        {date}
                        {!isSelected && isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-secondary" />}
                      </button>
                    )
                  })}

                  {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
                    <div key={`next-${i}`} className="h-7.5 flex items-center justify-center text-xs text-on-surface-variant/20">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
