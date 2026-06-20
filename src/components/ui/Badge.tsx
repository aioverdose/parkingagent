import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "success" | "info" | "warning" | "error" | "default";
  label?: string;
}

const variants = {
  success: "bg-[#E6F4EA] text-[#0F9D58]",
  info: "bg-[#E8F0FE] text-[#4285F4]",
  warning: "bg-[#FFF8E1] text-[#FBBB05]",
  error: "bg-[#FCE8E6] text-[#E94335]",
  default: "bg-gray-100 text-[#757575]",
};

export function Badge({ children, variant = "default", className = "", label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      {label || children}
    </span>
  );
}
