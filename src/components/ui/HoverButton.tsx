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
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-base transition-all duration-300";

  const variants: Record<string, string> = {
    primary:
      "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)]",
    secondary:
      "bg-white text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#DBEAFE]",
    success:
      "bg-[#10B981] text-white hover:bg-[#059669] shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
    danger:
      "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_4px_12px_rgba(239,68,68,0.3)]",
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
          : { y: -2, transition: { duration: 0.3, ease: "easeOut" } }
      }
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
