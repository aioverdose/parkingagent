import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  children: ReactNode;
  href?: string;
}

const variants = {
  primary: "bg-[#4285F4] text-white hover:bg-[#1A73E8]",
  secondary: "border border-gray-300 text-[#757575] hover:bg-gray-50 hover:text-[#202124]",
  success: "bg-[#0F9D58] text-white hover:bg-[#34A853]",
  danger: "bg-[#E94335] text-white hover:bg-[#D32F2F]",
  ghost: "text-[#4285F4] hover:bg-[#E8F0FE]",
};

const sizes = {
  xs: "text-xs px-2.5 py-1.5",
  sm: "text-sm px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

export function Button({ variant = "primary", size = "md", children, className = "", href, ...props }: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }

  return <button className={cls} {...props}>{children}</button>;
}
