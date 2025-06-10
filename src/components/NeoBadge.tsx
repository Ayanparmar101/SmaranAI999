
import React from "react";
import { cn } from "@/lib/utils";

interface NeoBadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "pink" | "orange" | "default";
  size?: "sm" | "md" | "lg";
  outline?: boolean;
  className?: string;
}

const NeoBadge: React.FC<NeoBadgeProps> = ({
  children,
  color = "default",
  size = "md",
  outline = false,
  className
}) => {
  const colorMap = {
    default: outline ? "text-black border-black" : "bg-white text-black",
    blue: outline ? "text-[#0EA5E9] border-[#0EA5E9]" : "bg-[#0EA5E9] text-white",
    green: outline ? "text-[#10B981] border-[#10B981]" : "bg-[#10B981] text-white",
    yellow: outline ? "text-[#F59E0B] border-[#F59E0B]" : "bg-[#F59E0B] text-white",
    red: outline ? "text-[#EF4444] border-[#EF4444]" : "bg-[#EF4444] text-white",
    purple: outline ? "text-[#8B5CF6] border-[#8B5CF6]" : "bg-[#8B5CF6] text-white",
    pink: outline ? "text-[#D946EF] border-[#D946EF]" : "bg-[#D946EF] text-white",
    orange: outline ? "text-[#F97316] border-[#F97316]" : "bg-[#F97316] text-white"
  };

  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-md border-2 border-black shadow-neo-sm",
        colorMap[color],
        sizeMap[size],
        outline ? "bg-transparent" : "",
        className
      )}
    >
      {children}
    </span>
  );
};

export default NeoBadge;
