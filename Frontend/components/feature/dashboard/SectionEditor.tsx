"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { useLayoutConfigStore } from "@/stores/layoutConfig.store";

export default function SectionEditor() {
  const { sections, reorderSections, toggleVisibility, resetToDefault } =
    useLayoutConfigStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderSections(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const moveUp = (index: number) => {
    if (index > 0) reorderSections(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < sections.length - 1) reorderSections(index, index + 1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-primary">Section Order</h2>
          <p className="text-[10px] sm:text-sm text-on-surface-variant mt-0.5 sm:mt-1">
            Drag & drop atau gunakan tombol untuk mengatur urutan
          </p>
        </div>
        <button
          onClick={resetToDefault}
          className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-lg sm:rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-error/8 hover:text-error hover:border-error/25 transition-all duration-300 shrink-0"
        >
          <Icon name="restart_alt" size="sm" />
          Reset
        </button>
      </div>

      {/* Section List */}
      <div className="flex flex-col gap-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`
              group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-300 cursor-grab active:cursor-grabbing
              ${
                dragIndex === index
                  ? "opacity-40 scale-95 border-secondary/30 bg-secondary/5"
                  : dragOverIndex === index
                  ? "border-secondary bg-secondary/8 shadow-lg shadow-secondary/5 scale-[1.02]"
                  : section.visible
                  ? "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/40 hover:shadow-md"
                  : "border-outline-variant/10 bg-surface-container-low/50"
              }
            `}
          >
            {/* Drag Handle */}
            <div className="shrink-0 text-on-surface-variant/30 group-hover:text-on-surface-variant/60 transition-colors">
              <Icon name="drag_indicator" size="md" />
            </div>

            {/* Section Number */}
            <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary/8 border border-secondary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Icon + Label */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon
                name={section.icon}
                filled
                className={`shrink-0 ${
                  section.visible
                    ? "text-secondary"
                    : "text-on-surface-variant/30"
                }`}
              />
              <div className="min-w-0">
                <span
                  className={`block text-sm font-semibold truncate transition-all ${
                    section.visible
                      ? "text-primary"
                      : "text-on-surface-variant/40 line-through"
                  }`}
                >
                  {section.label}
                </span>
                <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest font-medium">
                  {section.id}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Move Up */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveUp(index);
                }}
                disabled={index === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-surface-container-high disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <Icon name="arrow_upward" size="sm" />
              </button>

              {/* Move Down */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveDown(index);
                }}
                disabled={index === sections.length - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-surface-container-high disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <Icon name="arrow_downward" size="sm" />
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-outline-variant/15 mx-1 hidden sm:block" />

              {/* Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(section.id);
                }}
                className={`
                  relative w-12 h-7 rounded-full transition-all duration-300 shrink-0
                  ${
                    section.visible
                      ? "bg-secondary shadow-inner"
                      : "bg-surface-container-highest"
                  }
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center
                    ${section.visible ? "left-[22px]" : "left-0.5"}
                  `}
                >
                  <Icon
                    name={section.visible ? "visibility" : "visibility_off"}
                    size="sm"
                    className={`text-[10px] !text-xs ${
                      section.visible
                        ? "text-secondary"
                        : "text-on-surface-variant/40"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
