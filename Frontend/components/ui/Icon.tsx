interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-5xl",
};

export default function Icon({
  name,
  filled = false,
  className = "",
  size = "md",
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeStyles[size]} ${className}`}
      style={
        filled
          ? { fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }
          : undefined
      }
    >
      {name}
    </span>
  );
}
