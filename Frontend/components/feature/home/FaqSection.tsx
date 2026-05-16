"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/layout/Container";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Icon from "@/components/ui/Icon";
import { useSectionContentStore } from "@/stores/sectionContent.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqStore = useSectionContentStore((s) => s.faq);
  const hydrated = useHydrated();
  const f = hydrated ? faqStore : useSectionContentStore.getState().faq;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 sm:py-28 md:py-[160px] relative" id="faq">
      {/* Decorative top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

      <Container className="relative">
        {/* Background text decoration */}
        <div className="absolute top-10 right-0 text-[80px] sm:text-[120px] md:text-[180px] font-black text-primary/[0.02] select-none leading-none -z-10 hidden sm:block">
          FAQ
        </div>

        {/* Section heading */}
        <AnimateOnScroll variant="fadeUp" className="text-center mb-12 sm:mb-16 md:mb-20">
          <SectionHeading
            label={f.label}
            title={
              <>
                {f.headingBold}{" "}
                <span className="font-extralight italic">{f.headingItalic}</span>
              </>
            }
            description={f.description}
            className="max-w-3xl mx-auto"
          />
        </AnimateOnScroll>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {f.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <AnimateOnScroll
                key={index}
                variant="fadeUp"
                delay={index * 0.08}
              >
                <div
                  className={`
                    rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-500
                    ${
                      isOpen
                        ? "bg-white border-secondary/20 shadow-lg shadow-secondary/5"
                        : "bg-white/60 border-outline-variant/20 hover:bg-white hover:border-outline-variant/40"
                    }
                  `}
                >
                  {/* Left accent bar */}
                  <div
                    className={`
                      absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl transition-all duration-500
                      ${isOpen ? "bg-secondary opacity-100" : "opacity-0"}
                    `}
                  />

                  <button
                    className="w-full flex items-center justify-between p-5 sm:p-6 md:p-8 text-left cursor-pointer gap-4"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0
                          flex items-center justify-center transition-all duration-300
                          ${
                            isOpen
                              ? "bg-secondary/15 border border-secondary/20"
                              : "bg-secondary/5 border border-secondary/10"
                          }
                        `}
                      >
                        <span
                          className={`
                            text-sm sm:text-base font-bold transition-colors duration-300
                            ${isOpen ? "text-secondary" : "text-secondary/50"}
                          `}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3
                        className={`
                          text-sm sm:text-base md:text-lg font-semibold transition-colors duration-300
                          ${isOpen ? "text-primary" : "text-primary/80"}
                        `}
                      >
                        {item.question}
                      </h3>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="shrink-0"
                    >
                      <Icon
                        name="expand_more"
                        className={`text-xl sm:text-2xl transition-colors duration-300 ${
                          isOpen ? "text-secondary" : "text-primary/25"
                        }`}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
                          opacity: { duration: 0.3, delay: 0.1 },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8">
                          <div className="pl-11 sm:pl-14">
                            <div className="h-px bg-gradient-to-r from-secondary/15 via-outline-variant/10 to-transparent mb-4 sm:mb-5" />
                            <p className="text-sm sm:text-base text-on-surface-variant/75 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
