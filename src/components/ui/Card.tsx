import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  title?: string;
  style?: Record<string, string>;
}

export function Card({ children, className = "", padding = "md", hover = false, title, style }: CardProps) {
  const pad = { sm: "p-4", md: "p-6", lg: "p-8", xl: "p-10" };
  return (
    <div
      className={`bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${
        hover ? "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300" : ""
      } ${pad[padding]} ${className}`}
      style={style}
    >
      {title && <h3 className="font-bold text-xl text-[#111827] mb-4">{title}</h3>}
      {children}
    </div>
  );
}
