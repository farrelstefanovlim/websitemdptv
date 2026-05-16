import { ReactNode } from "react";

interface SectionHeadingProps {
  label: string;
  title: ReactNode;
  description?: string;
  labelIcon?: "line" | "dot";
  className?: string;
}

export default function SectionHeading({
  label,
  title,
  description,
  labelIcon = "line",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        {labelIcon === "line" ? (
          <span className="h-px w-12 bg-secondary" />
        ) : (
          <div className="w-3 h-3 bg-secondary" />
        )}
        <span className="text-secondary text-label-bold text-xs uppercase tracking-widest">
          {label}
        </span>
      </div>
      <h2 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
