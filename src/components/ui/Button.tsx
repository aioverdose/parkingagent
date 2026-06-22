import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  href?: string;
}

const variants = {
  primary:
    "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]",
  secondary:
    "bg-white text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#DBEAFE]",
  success:
    "bg-[#10B981] text-white hover:bg-[#059669] shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
  danger:
    "bg-[#E94335] text-white hover:bg-[#D32F2F] shadow-[0_4px_12px_rgba(233,67,53,0.3)]",
  ghost:
    "text-[#2563EB] hover:bg-[#DBEAFE]",
};

const sizes = {
  xs: "text-xs px-3 py-1.5",
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
  xl: "text-lg px-8 py-4",
};

export function Button({ variant = "primary", size = "md", children, className = "", href, ...props }: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }

  return <button className={cls} {...props}>{children}</button>;
}
