import { ReactNode } from "react";

type BadgeVariant = "default" | "glass" | "surface";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  dotColor?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-secondary/10 text-secondary",
  glass:
    "glass-card text-white/60 border-white/20",
  surface:
    "bg-surface-container-high text-primary/40 border border-outline-variant/30",
};

export default function Badge({
  children,
  variant = "default",
  dot = false,
  dotColor = "bg-secondary",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-2
        px-3 py-1 rounded-full
        text-label-bold text-[10px] uppercase tracking-widest
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      )}
      {children}
    </span>
  );
}
