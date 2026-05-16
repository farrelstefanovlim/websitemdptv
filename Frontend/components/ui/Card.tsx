import { ReactNode } from "react";

type CardVariant = "glass-dark" | "glass-light" | "elevated";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  "glass-dark": "glass-card-premium",
  "glass-light": "glass-card-light",
  elevated: "bg-white card-elevated border border-outline-variant/15",
};

export default function Card({
  children,
  variant = "glass-dark",
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        ${variantStyles[variant]}
        rounded-3xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}
