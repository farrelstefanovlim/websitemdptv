"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
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
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary font-display">
            Urutan & Visibilitas Section
          </h2>
          <p className="text-xs text-on-surface-variant/60 mt-0.5">
            Tarik & geser (drag-drop) atau gunakan tombol panah untuk mengatur alur landing page
          </p>
        </div>
        <Button
          variant="none"
          size="none"
          onClick={resetToDefault}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-outline-variant/20 text-on-surface-variant/70 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all shrink-0"
        >
          <Icon name="restart_alt" size="sm" className="!text-xs" />
          <span>Reset Default</span>
        </Button>
      </div>

      {/* Section List */}
      <div className="flex flex-col gap-2.5">
        {sections.map((section, index) => {
          const isDragging = dragIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
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
                group flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing select-none
                ${
                  isDragging
                    ? "opacity-30 scale-95 border-secondary/40 bg-secondary/10"
                    : isDragOver
                    ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/10 scale-[1.01]"
                    : section.visible
                    ? "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30 hover:shadow-sm"
                    : "border-outline-variant/10 bg-surface-container-low/40 opacity-70"
                }
              `}
            >
              {/* Drag Handle */}
              <div className="shrink-0 text-on-surface-variant/30 group-hover:text-on-surface-variant/70 transition-colors">
                <Icon name="drag_indicator" size="md" />
              </div>

              {/* Position Number */}
              <div className="shrink-0 w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center">
                <span className="text-xs font-bold text-on-surface-variant/70 font-display">
                  {index + 1}
                </span>
              </div>

              {/* Icon & Details */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    section.visible
                      ? "bg-secondary/10 text-secondary"
                      : "bg-surface-container-high text-on-surface-variant/40"
                  }`}
                >
                  <Icon name={section.icon} filled={section.visible} size="sm" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`block text-xs sm:text-sm font-bold truncate transition-all ${
                      section.visible
                        ? "text-primary"
                        : "text-on-surface-variant/40 line-through"
                    }`}
                  >
                    {section.label}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/45 uppercase tracking-wider font-semibold font-mono">
                    #{section.id}
                  </span>
                </div>
              </div>

              {/* Up/Down and Visibility Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(index);
                  }}
                  disabled={index === 0}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-surface-container-high disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  title="Pindah ke Atas"
                >
                  <Icon name="arrow_upward" size="sm" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(index);
                  }}
                  disabled={index === sections.length - 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-surface-container-high disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  title="Pindah ke Bawah"
                >
                  <Icon name="arrow_downward" size="sm" />
                </button>

                <div className="w-[1px] h-5 bg-outline-variant/15 mx-1 hidden sm:block" />

                {/* Visibility Pill Switch */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(section.id);
                  }}
                  className={`
                    relative w-12 h-6.5 rounded-full transition-all duration-300 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50
                    ${section.visible ? "bg-secondary" : "bg-surface-container-highest"}
                  `}
                  title={section.visible ? "Sembunyikan Section" : "Tampilkan Section"}
                >
                  <div
                    className={`
                      absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center
                      ${section.visible ? "left-[25px]" : "left-0.5"}
                    `}
                  >
                    <Icon
                      name={section.visible ? "visibility" : "visibility_off"}
                      size="sm"
                      className={`!text-[11px] ${
                        section.visible ? "text-secondary" : "text-on-surface-variant/40"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
