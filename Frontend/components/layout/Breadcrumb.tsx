"use client"

import Link from "next/link"
import Icon from "@/components/ui/Icon"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // Always include Home/Dashboard as first item if not already provided
  const allItems: BreadcrumbItem[] = [{ label: "Admin", href: "/admin/dashboard", icon: "space_dashboard" }, ...items]

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center flex-wrap gap-1 text-[11px] sm:text-xs font-semibold text-on-surface-variant/60 ${className}`}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <Icon name="chevron_right" size="xs" className="text-on-surface-variant/40 shrink-0 !text-[14px]" />}

            {item.href && !isLast ? (
              <Link href={item.href} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-surface-container-high hover:text-primary transition-all text-on-surface-variant/70 shrink-0">
                {item.icon && <Icon name={item.icon} size="xs" className="!text-[14px]" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg shrink-0 ${isLast ? "text-primary font-bold bg-surface-container-low border border-outline-variant/15 text-secondary" : "text-on-surface-variant/70"}`} aria-current={isLast ? "page" : undefined}>
                {item.icon && <Icon name={item.icon} size="xs" className="!text-[14px]" />}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
