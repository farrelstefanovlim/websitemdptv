import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "glass";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary border-b-4 border-black/15 hover:border-secondary-container hover:shadow-lg hover:shadow-secondary/10",
  secondary:
    "bg-secondary text-on-secondary hover:brightness-110 hover:scale-[1.03] border-b-4 border-black/30 hover:shadow-lg hover:shadow-secondary/20",
  outline:
    "bg-white/80 backdrop-blur-sm text-secondary border border-outline-variant/25 border-b-4 border-gray-200/80 hover:bg-secondary hover:text-on-secondary hover:border-secondary hover:shadow-lg hover:shadow-secondary/10",
  glass:
    "glass-card-premium text-white border-b-4 border-white/8 hover:bg-white/12 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-xs rounded-xl",
  md: "px-8 py-4 text-sm rounded-2xl",
  lg: "px-10 py-5 text-sm rounded-2xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-bold uppercase tracking-widest
        transition-all duration-300 ease-out active:scale-95 cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}
