"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HoverButton({
  children,
  className,
  variant = "primary",
  onClick,
  disabled,
  type,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors";

  const variants = {
    primary: "bg-[#4285F4] text-white hover:bg-[#1A73E8]",
    secondary: "border-2 border-gray-300 text-[#757575] hover:border-[#4285F4] hover:text-[#4285F4]",
    success: "bg-[#0F9D58] text-white hover:bg-[#34A853]",
    danger: "bg-[#E94335] text-white hover:bg-[#D93025]",
  };

  return (
    <motion.button
      type={type}
      className={cn(base, variants[variant], disabled && "opacity-50 cursor-not-allowed", className)}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.04,
              y: -2,
              boxShadow: "0 8px 20px rgba(66,133,244,0.35)",
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
