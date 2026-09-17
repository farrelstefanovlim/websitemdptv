"use client"

import { useEffect } from "react"
import SectionEditor from "@/components/feature/layoutEditor/SectionEditor"
import SectionPreview from "@/components/feature/layoutEditor/SectionPreview"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { useLayoutConfigStore } from "@/stores/layoutConfig.store"
import { useHydrated } from "@/hooks/useHydrated"

export default function Page() {
  const hydrated = useHydrated()
  const sections = useLayoutConfigStore((s) => s.sections)
  const fetchSections = useLayoutConfigStore((s) => s.fetchSections)
  const visibleCount = sections.filter((s) => s.visible).length

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────── */}
        <AdminPageHeader
          breadcrumbs={[{ label: "CMS & Media" }, { label: "Layout Editor" }]}
          icon="dashboard_customize"
          title="Layout Editor"
          description="Atur urutan dan visibilitas section."
          badge={
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/10 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[11px] font-semibold text-on-surface-variant/70">
                {visibleCount}/{sections.length} Section Aktif
              </span>
            </div>
          }
          actions={
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" startIcon={<Icon name="open_in_new" size="sm" />}>
                Buka Preview
              </Button>
            </a>
          }
        />

        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-4 sm:p-6">
              <SectionEditor />
            </div>
          </div>
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-4 sm:p-6 lg:sticky lg:top-24">
              <SectionPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
