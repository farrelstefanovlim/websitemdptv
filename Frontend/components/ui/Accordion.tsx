"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

interface AccordionItemData {
  icon: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  iconBg: string;
  iconColor: string;
  dotColor: string;
  accentColor?: string;
}

interface AccordionProps {
  items: AccordionItemData[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-5xl mx-auto space-y-4 sm:space-y-5 relative"
    >
      {/* Accent Line Decor */}
      <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/15 to-transparent hidden xl:block" />

      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`
              accordion-item border border-outline-variant/20 backdrop-blur-sm
              rounded-2xl sm:rounded-3xl md:rounded-[32px] overflow-hidden
              card-elevated relative
              ${isOpen
                ? "bg-white border-secondary/20"
                : "bg-white/70 hover:bg-white hover:border-outline-variant/40"
              }
            `}
          >
            {/* Left accent bar when expanded */}
            <div
              className={`
                absolute left-0 top-0 bottom-0 w-1 rounded-l-[32px] transition-all duration-500
                ${isOpen ? `${item.accentColor || "bg-secondary"} opacity-100` : "opacity-0"}
              `}
            />

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(index); } }}
              className="w-full flex items-center justify-between p-5 sm:p-8 md:p-10 text-left cursor-pointer gap-3 sm:gap-4 select-none outline-none focus-visible:bg-secondary/5 focus-visible:ring-2 focus-visible:ring-secondary/50"
              onClick={() => toggle(index)}
            >
              <div className="flex items-center gap-3 sm:gap-6 md:gap-8 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl shrink-0 ${item.iconBg} border ${item.iconColor} flex items-center justify-center relative overflow-hidden`}
                >
                  <Icon name={item.icon} size="lg" className="z-10" filled />
                  <div className="absolute -right-2 -bottom-2 opacity-10 font-black text-3xl sm:text-4xl">
                    {item.number}
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary leading-tight">
                    {item.title}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-label-bold text-secondary/50 uppercase tracking-widest mt-0.5 sm:mt-1 block">
                    {item.subtitle}
                  </span>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-primary/25 text-xl sm:text-2xl md:text-3xl accordion-icon shrink-0"
                style={{
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                add
              </span>
            </div>

            <div
              className={`
                accordion-content overflow-hidden px-5 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10
                ${isOpen ? "max-h-[900px] sm:max-h-[700px] md:max-h-[600px] opacity-100 mt-2 sm:mt-4 md:mt-6" : "max-h-0 opacity-0"}
              `}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-10 items-center">
                <div>
                  <p className="text-body-md text-on-surface-variant/80 leading-relaxed text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                    {item.description}
                  </p>
                  <ul className="space-y-3">
                    {item.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-primary/65"
                      >
                        <span className={`w-1.5 h-1.5 ${item.dotColor} rounded-full`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-video shadow-xl border border-outline-variant/20">
                  <img
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isOpen ? "scale-105" : "scale-100"}`}
                    src={item.image}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
