
import React from "react";
import { cn } from "@/lib/utils";

interface NeoDividerProps {
  className?: string;
  color?: "default" | "primary" | "secondary" | "accent";
  dashed?: boolean;
}

const NeoDivider: React.FC<NeoDividerProps> = ({ 
  className,
  color = "default",
  dashed = false
}) => {
  const colorClasses = {
    default: "border-black",
    primary: "border-[#0EA5E9]",
    secondary: "border-[#8B5CF6]",
    accent: "border-[#F97316]"
  };

  return (
    <div 
      className={cn(
        "h-0 w-full my-4",
        dashed ? "border-dashed border-2" : "border-solid border-3",
        colorClasses[color],
        className
      )}
    />
  );
};

export default NeoDivider;
