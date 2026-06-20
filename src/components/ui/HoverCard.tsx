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
        "rounded-xl bg-white p-6 shadow-3d-light border border-gray-100",
        glow && "hover:shadow-glow",
        className,
      )}
      whileHover={{
        y: -6,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
