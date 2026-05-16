import { ReactNode } from "react";
import Icon from "@/components/ui/Icon";

export type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; icon: string; border: string; textUrl: string; baseText: string; iconName: string }> = {
  info: {
    bg: "bg-secondary/5",
    border: "border-secondary/15",
    icon: "text-secondary",
    textUrl: "text-secondary",
    baseText: "text-on-surface-variant",
    iconName: "info"
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-500",
    textUrl: "text-green-600",
    baseText: "text-green-800",
    iconName: "check_circle"
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    textUrl: "text-amber-600",
    baseText: "text-amber-800",
    iconName: "warning"
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    textUrl: "text-red-600",
    baseText: "text-red-800",
    iconName: "error"
  }
};

export default function Alert({
  children,
  variant = "info",
  title,
  className = "",
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`
        p-4 rounded-2xl border flex items-start gap-3 transition-colors
        ${styles.bg} ${styles.border} ${styles.baseText} ${className}
      `}
      role="alert"
    >
      <Icon name={styles.iconName} className={`shrink-0 mt-0.5 ${styles.icon}`} />
      <div className="flex-1 text-sm leading-relaxed">
        {title && <h4 className={`font-bold mb-1 ${styles.textUrl}`}>{title}</h4>}
        {children}
      </div>
    </div>
  );
}
