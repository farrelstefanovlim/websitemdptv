import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Icon from "@/components/ui/Icon"
import { useRouter } from "next/navigation"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"
import { useSectionContentStore, DEFAULTS } from "@/stores/sectionContent.store"
import { useHydrated } from "@/hooks/useHydrated"
import { getImageUrl } from "@/lib/image"

export default function HeroSection() {
  const hero = useSectionContentStore((s) => s.hero)
  const hydrated = useHydrated()
  const router = useRouter()

  // Use defaults during SSR to avoid hydration mismatch
  const h = hydrated ? hero : DEFAULTS.hero

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black w-full max-w-[100vw]" id="home">
      {/* Background image with stronger overlay */}
      <div className="absolute inset-0 z-0 bg-black">
        {h.image && <img className="w-full h-full object-cover opacity-50 scale-105" alt="Professional media studio" src={getImageUrl(h.image)} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-secondary/8 mix-blend-color" />

        {/* Decorative lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent hidden lg:block" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent hidden lg:block" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden lg:block" />
      </div>

      {/* Floating micro-elements */}
      <div className="absolute top-40 right-[15%] floating hidden lg:block">
        <Badge variant="glass" dot dotColor="bg-secondary">
          REC LIVE
        </Badge>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-32 pb-32">
        <div className="max-w-5xl">
          <AnimateOnScroll variant="fadeDown" delay={0.2}>
            <Badge variant="glass" dot dotColor="bg-secondary animate-pulse" className="mb-8 sm:mb-10">
              <span className="text-white/80 tracking-[0.2em]">{h.badgeText}</span>
            </Badge>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.4} duration={0.8}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] md:leading-[0.92] mb-6 sm:mb-10 flex flex-col gap-1 w-full max-w-[100vw] break-words">
              <span className="font-black relative tracking-tight whitespace-normal break-words">{h.titleLine1}</span>
              <span className="font-extralight italic opacity-80 text-2xl sm:text-4xl md:text-5xl lg:text-6xl whitespace-normal break-words">{h.titleLine2}</span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeIn" delay={0.6}>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-secondary to-secondary/30 mb-8 sm:mb-10 rounded-full" />
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.8}>
            <p className="text-base sm:text-body-lg text-white/55 mb-10 sm:mb-14 max-w-xl leading-relaxed">{h.description}</p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={1.0}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-lg shadow-secondary/20" onClick={() => router.push("/daftar")}>
                Join Us
              </Button>
              <Button variant="glass" size="lg" className="w-full sm:w-auto" onClick={() => router.push("/galeri")}>
                {h.buttonPrimary}
              </Button>
              <Button variant="glass" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
                {h.buttonSecondary}
              </Button>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Stats Row — Integrated */}
        <AnimateOnScroll variant="fadeUp" delay={1.2} className="mt-16 sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-3 gap-2 sm:gap-0 sm:flex sm:items-center sm:gap-8 lg:gap-16 w-full max-w-[100vw] pr-4 sm:pr-0">
            {h.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-8 lg:gap-16">
                {i > 0 && <div className="hidden sm:block w-px h-12 bg-white/15 shrink-0" />}
                <div className="relative text-center sm:text-left">
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[8px] sm:text-[10px] text-label-bold text-white/35 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Scroll</span>
        <div className="scroll-indicator">
          <Icon name="expand_more" className="text-white/40 text-2xl" />
        </div>
      </div>

      {/* Bottom gradient — smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent z-10 pointer-events-none" />
    </section>
  )
}
