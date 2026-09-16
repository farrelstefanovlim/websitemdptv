import React from "react";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rounded" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "rounded",
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: "h-3 w-full rounded-md",
    circular: "rounded-full shrink-0",
    rounded: "rounded-2xl",
    rectangular: "rounded-none",
  };

  const style: React.CSSProperties = {
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
  };

  return (
    <div
      style={style}
      className={`
        animate-pulse bg-surface-container-high/60
        ${variantStyles[variant]}
        ${className}
      `}
    />
  );
}
