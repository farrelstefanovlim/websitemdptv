import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import AnimateOnScroll, {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/AnimateOnScroll";

const footerLinks = {
  Navigation: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Divisions", href: "#divisions" },
  ],
  Categories: [
    { label: "Visual Arts", href: "#" },
    { label: "Digital Media", href: "#" },
    { label: "Production", href: "#" },
  ],
  Social: [
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "Behance", href: "#" },
  ],
  Contact: [
    { label: "Email Us", href: "#" },
    { label: "WhatsApp", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white py-12 sm:py-16 md:py-20 border-t border-outline-variant/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full grid-pattern opacity-[0.03] -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-[80px] relative">
        {/* Top Section */}
        <AnimateOnScroll variant="fadeUp">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 sm:gap-12 md:gap-16 mb-10 sm:mb-14 md:mb-16">
            {/* Brand */}
            <div className="max-w-md">
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Icon name="settings_input_component" />
                </div>
                <div className="text-3xl sm:text-4xl text-primary font-black tracking-tighter font-display">
                  MDPTV
                </div>
              </div>
              <p className="text-on-surface-variant/70 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6">
                © 2024 UKM MDPTV Universitas Multi Data Palembang.
                <br />
                Crafted for the future of media.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="surface">MDP UNIVERSITY</Badge>
                <Badge variant="surface">PALEMBANG</Badge>
              </div>
            </div>

            {/* Link Columns */}
            <StaggerContainer
              className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 md:gap-12 w-full lg:w-auto"
              staggerDelay={0.1}
            >
              {Object.entries(footerLinks).map(([title, links]) => (
                <StaggerItem key={title} className="flex flex-col gap-4 sm:gap-5">
                  <span className="text-[10px] text-label-bold text-primary/35 uppercase tracking-widest relative">
                    {title}
                    <span className="absolute -bottom-2 left-0 w-4 h-0.5 bg-secondary rounded-full" />
                  </span>
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-on-surface-variant/60 hover:text-secondary transition-colors duration-300 text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </AnimateOnScroll>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            <Link
              href="#"
              className="text-xs text-on-surface-variant/40 hover:text-primary transition-colors duration-300 uppercase tracking-widest"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-on-surface-variant/40 hover:text-primary transition-colors duration-300 uppercase tracking-widest"
            >
              Terms of Service
            </Link>
          </div>
          <div className="flex gap-3">
            <Link
              href="#"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-outline-variant/20 flex items-center justify-center text-on-surface-variant/50 hover:bg-secondary hover:border-secondary hover:text-white transition-all duration-300"
            >
              <Icon name="share" size="md" />
            </Link>
            <Link
              href="#"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-outline-variant/20 flex items-center justify-center text-on-surface-variant/50 hover:bg-secondary hover:border-secondary hover:text-white transition-all duration-300"
            >
              <Icon name="alternate_email" size="md" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
