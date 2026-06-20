"use client";

import { useEffect, useRef } from "react";
import VanillaTilt from "vanilla-tilt";
import type { TiltOptions } from "vanilla-tilt";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  options,
}: {
  children: React.ReactNode;
  className?: string;
  options?: TiltOptions;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    VanillaTilt.init(ref.current, {
      max: 8,
      speed: 400,
      scale: 1.02,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      glare: true,
      "max-glare": 0.2,
      ...options,
    });
  }, [options]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-white p-6 shadow-3d-light border border-gray-100 transform-style-preserve-3d",
        className,
      )}
    >
      {children}
    </div>
  );
}
