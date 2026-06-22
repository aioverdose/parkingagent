import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "success" | "info" | "warning" | "error" | "default";
  label?: string;
}

const variants: Record<string, string> = {
  success: "bg-[#D1FAE5] text-[#059669]",
  info: "bg-[#DBEAFE] text-[#2563EB]",
  warning: "bg-[#FEF3C7] text-[#D97706]",
  error: "bg-[#FEE2E2] text-[#DC2626]",
  default: "bg-[#F1F5F9] text-[#64748B]",
};

export function Badge({ children, variant = "default", className = "", label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg ${variants[variant]} ${className}`}>
      {label || children}
    </span>
  );
}
