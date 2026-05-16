import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`max-w-[1440px] mx-auto px-6 md:px-[80px] ${className}`}>
      {children}
    </div>
  );
}
