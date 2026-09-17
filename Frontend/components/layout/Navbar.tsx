"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"

import { useLayoutConfigStore } from "@/stores/layoutConfig.store"
import { useSectionContentStore } from "@/stores/sectionContent.store"
import { useHydrated } from "@/hooks/useHydrated"

const navLinks = [
  { label: "HOME", href: "#home" },
  { label: "DIVISIONS", href: "#divisions" },
  { label: "DOCUMENTATION", href: "#documentation" },
  { label: "ABOUT", href: "#about" },
]

export default function Navbar() {
  const [activeHash, setActiveHash] = useState("#home")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  const isLayoutLoading = useLayoutConfigStore((s) => s.isLoading)
  const isContentLoading = useSectionContentStore((s) => s.isLoading)
  const hydrated = useHydrated()
  const isFetchingAPI = isLayoutLoading || isContentLoading || !hydrated

  useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash || "#home")
    window.addEventListener("hashchange", handleHashChange)

    if (isFetchingAPI) return // Wait until sections are rendered

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`)
          }
        })
      },
      { rootMargin: "-40% 0px -40% 0px" }, // Triggers closer to the center of the viewport
    )

    const elements = navLinks.map((link) => (link.href.startsWith("#") ? document.getElementById(link.href.substring(1)) : null)).filter(Boolean)

    elements.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      observer.disconnect()
    }
  }, [isFetchingAPI])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} className="fixed top-0 z-[60] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-20 sm:h-24 flex items-center justify-center pointer-events-none">
      <div
        className={`
          w-full max-w-[1440px] flex justify-between items-center rounded-2xl px-4 sm:px-8 h-14 sm:h-16 pointer-events-auto transition-all duration-500
          ${isScrolled ? "glass-card-light border-outline-variant/30" : "bg-white/5 backdrop-blur-md border border-white/10"}
        `}
      >
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo-mdptv.png" alt="MDPTV Logo" width={40} height={40} className="w-full h-full object-contain drop-shadow-sm" priority />
          </div>
          <span className={`text-xl sm:text-2xl font-black tracking-tighter font-display transition-colors duration-500 ${isScrolled ? "text-primary" : "text-white"}`}>MDPTV</span>
        </Link>

        {/* Navigation Links — Desktop */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map(({ label, href }) => {
            const isActive = activeHash === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setActiveHash(href)}
                className={`
                  text-sm tracking-wide relative group transition-all duration-300
                  ${isActive ? `font-bold ${isScrolled ? "text-secondary" : "text-white"}` : `${isScrolled ? "text-on-surface-variant/70 hover:text-primary" : "text-white/60 hover:text-white"}`}
                `}
              >
                {label}
                <span
                  className={`
                    absolute -bottom-1 left-0 w-full h-0.5 bg-secondary transition-transform origin-left duration-300
                    ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                  `}
                />
              </Link>
            )
          })}
        </nav>

        {/* Mobile Hamburger */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setMobileOpen(!mobileOpen)
            }
          }}
          className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl transition-colors shrink-0"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Buka navigasi menu"
        >
          <span className={`w-6 h-0.5 transition-all duration-300 ${isScrolled ? "bg-primary" : "bg-white"} ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 transition-all duration-300 ${isScrolled ? "bg-primary" : "bg-white"} ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 transition-all duration-300 ${isScrolled ? "bg-primary" : "bg-white"} ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </div>

        {/* CTA — Desktop */}
        <div className="hidden md:block">
          <Button variant={isScrolled ? "primary" : "glass"} size="sm" onClick={() => router.push("/daftar")}>
            Join Us
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="absolute top-full left-4 right-4 mt-2 glass-card-light rounded-2xl p-6 pointer-events-auto border-outline-variant/30 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  setActiveHash(href)
                  setMobileOpen(false)
                }}
                className={`
                  text-sm tracking-wide px-4 py-3 rounded-xl transition-all duration-300 flex items-center min-h-[44px]
                  ${activeHash === href ? "bg-secondary/15 text-secondary font-bold" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"}
                `}
              >
                {label}
              </Link>
            ))}
            <Button
              variant="primary"
              size="md"
              className="mt-2 w-full min-h-[48px]"
              onClick={() => {
                router.push("/daftar")
                setMobileOpen(false)
              }}
            >
              Join Us
            </Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
