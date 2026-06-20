import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  title?: string;
  style?: Record<string, string>;
}

export function Card({ children, className = "", padding = "md", hover = false, title, style }: CardProps) {
  const pad = { sm: "p-3", md: "p-5", lg: "p-6" };
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${pad[padding]} ${hover ? "hover:shadow-md hover:border-gray-300 transition-all" : ""} ${className}`} style={style}>
      {title && <h3 className="font-semibold text-[#202124] text-xs mb-3">{title}</h3>}
      {children}
    </div>
  );
}
