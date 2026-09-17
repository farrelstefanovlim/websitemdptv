"use client"

import React, { ReactNode } from "react"
import { createPortal } from "react-dom"
import Icon from "@/components/ui/Icon"
import Breadcrumb, { BreadcrumbItem } from "./Breadcrumb"
import { usePortalTarget } from "@/hooks/usePortalTarget"
import { useHydrated } from "@/hooks/useHydrated"

export interface AdminPageHeaderProps {
  title: ReactNode
  description?: ReactNode
  icon?: string
  iconClass?: string
  breadcrumbs?: BreadcrumbItem[]
  badge?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
  syncTopbarTitle?: boolean
}

export default function AdminPageHeader({ title, description, icon, iconClass = "bg-secondary/10 text-secondary border-secondary/20", breadcrumbs = [], badge, actions, children, className = "", syncTopbarTitle = true }: AdminPageHeaderProps) {
  const hydrated = useHydrated()
  const mobileTitlePortalTarget = usePortalTarget("mobile-topbar-title")

  const topbarTitleElement = (
    <div className="min-w-0 pr-2">
      <h2 className="text-xs sm:text-sm font-bold text-primary truncate leading-tight">{typeof title === "string" ? title : title}</h2>
      {description && typeof description === "string" && <p className="text-[10px] text-on-surface-variant/60 truncate leading-tight mt-0.5 hidden sm:block">{description}</p>}
    </div>
  )

  return (
    <>
      {syncTopbarTitle && hydrated && mobileTitlePortalTarget && createPortal(topbarTitleElement, mobileTitlePortalTarget)}

      <div className={`bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 ${className}`}>
        {/* Top: Breadcrumbs & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-outline-variant/10">
          <Breadcrumb items={breadcrumbs} />
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {/* Middle: Title, Description & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {icon && (
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconClass}`}>
                <Icon name={icon} filled size="md" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-primary font-display flex items-center gap-2 flex-wrap">{title}</h1>
              {description && <p className="text-xs sm:text-sm text-on-surface-variant/70 mt-1 font-medium leading-relaxed">{description}</p>}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
        </div>

        {/* Bottom Slot: Sub-tabs, Period Switchers, or Search/Filters */}
        {children && <div className="pt-2 border-t border-outline-variant/10">{children}</div>}
      </div>
    </>
  )
}
