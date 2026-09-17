"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store"
import { useGalleryStore } from "@/stores/gallery.store"
import { useHydrated } from "@/hooks/useHydrated"
import { getImageUrl } from "@/lib/image"
import type { GalleryItem } from "@/components/feature/content/types/content.type"

export default function GaleriPage() {
  const doc = useSectionContentStore((s) => s.documentation)
  const hydrated = useHydrated()
  const d = hydrated ? doc : DEFAULTS.documentation
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { items: storeItems, isLoading, fetchGallery } = useGalleryStore()

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const items = storeItems.filter((item) => item.image)

  // Group by uploadedAt date, sorted newest first
  const grouped = useMemo(() => {
    const map: Record<string, typeof items> = {}
    items.forEach((item) => {
      const date = item.uploadedAt || "Lainnya"
      if (!map[date]) map[date] = []
      map[date].push(item)
    })
    return Object.entries(map).sort(([a], [b]) => {
      if (a === "Lainnya") return 1
      if (b === "Lainnya") return -1
      return b.localeCompare(a)
    })
  }, [items])

  const formatDate = (dateStr: string) => {
    if (dateStr === "Lainnya") return dateStr
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Flat index for lightbox navigation
  const flatIndexOf = (item: (typeof items)[0]) => items.indexOf(item)

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface relative">
      <div className="fixed inset-0 noise-bg z-0" />
      <div className="fixed inset-0 grid-pattern z-0 opacity-15" />

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group">
            <Icon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Kembali</span>
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/logo-mdptv.png" alt="MDPTV Logo" width={36} height={36} className="h-8 sm:h-9 w-auto object-contain" />
            <span className="text-xl font-black tracking-tighter font-display text-primary">MDPTV</span>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[1440px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-secondary" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-secondary font-bold">{d.badgeText}</span>
              <span className="w-8 h-px bg-secondary" />
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-primary">
              {d.headingBold} <span className="font-extralight italic opacity-80">{d.headingItalic}</span>
            </h1>
            <p className="text-sm sm:text-lg text-on-surface-variant/80 max-w-2xl leading-relaxed">{d.description}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-on-surface-variant/60 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="photo_library" size="sm" />
                  <span>{items.length} foto</span>
                </div>
                <span className="text-outline-variant">·</span>
                <div className="flex items-center gap-2">
                  <Icon name="folder" size="sm" />
                  <span>{grouped.length} album</span>
                </div>
              </div>
              <Link href="/daftar">
                <Button variant="secondary" size="sm" startIcon={<Icon name="how_to_reg" size="sm" />}>
                  Join Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery grouped by date */}
      <section className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-20 sm:pb-32">
        <div className="max-w-[1440px] mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-32">
              <Icon name="photo_library" className="text-outline-variant !text-7xl mx-auto mb-4" />
              <p className="text-on-surface-variant/60 text-lg">Belum ada dokumentasi</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12 sm:gap-16">
              {grouped.map(([date, groupItems], groupIdx) => (
                <motion.div key={date} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: groupIdx * 0.1 }}>
                  {/* Date header */}
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <h2 className="text-lg sm:text-xl font-bold text-primary">{formatDate(date)}</h2>
                    </div>
                    <span className="text-xs text-on-surface-variant/50 font-medium">{groupItems.length} foto</span>
                    <div className="flex-1 h-px bg-outline-variant/15" />
                  </div>

                  {/* Masonry grid */}
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4">
                    {groupItems.map((item, i) => (
                      <div key={i} className="mb-3 sm:mb-4 break-inside-avoid group cursor-pointer" onClick={() => setSelectedIndex(flatIndexOf(item))}>
                        <div className="rounded-2xl sm:rounded-3xl overflow-hidden relative border border-outline-variant/15 bg-surface-container-low hover:border-secondary/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
                          <img src={getImageUrl(item.image)} alt={item.title || `Dokumentasi ${i + 1}`} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 sm:p-6">
                            {item.label && <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold mb-1">{item.label}</span>}
                            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{item.title}</h3>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8" onClick={() => setSelectedIndex(null)}>
            <Button variant="none" size="none" onClick={() => setSelectedIndex(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
              <Icon name="close" className="text-white" />
            </Button>

            {selectedIndex > 0 && (
              <Button
                variant="none"
                size="none"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex(selectedIndex - 1)
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              >
                <Icon name="chevron_left" className="text-white !text-2xl" />
              </Button>
            )}

            {selectedIndex < items.length - 1 && (
              <Button
                variant="none"
                size="none"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex(selectedIndex + 1)
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              >
                <Icon name="chevron_right" className="text-white !text-2xl" />
              </Button>
            )}

            <motion.div key={selectedIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="max-w-5xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
              <img src={getImageUrl(items[selectedIndex].image)} alt={items[selectedIndex].title || `Dokumentasi ${selectedIndex + 1}`} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
              {(items[selectedIndex].label || items[selectedIndex].title) && (
                <div className="mt-4 text-center">
                  {items[selectedIndex].label && <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold block mb-1">{items[selectedIndex].label}</span>}
                  <h3 className="text-lg sm:text-xl font-bold text-white">{items[selectedIndex].title}</h3>
                  <span className="text-xs text-white/30 mt-2 block">
                    {selectedIndex + 1} / {items.length}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
