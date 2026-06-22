"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HoverCard({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        glow && "hover:shadow-[0_0_30px_rgba(37,99,235,0.22)]",
        className,
      )}
      whileHover={{
        y: -2,
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
