
import React from "react";
import { cn } from "@/lib/utils";
import { NeoButton } from "@/components/NeoButton";

interface DoodleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "pink" | "orange";
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  variant?: "default" | "outline" | "ghost";
  fullWidth?: boolean;
}

const DoodleButton = ({
  color = "blue",
  children,
  icon,
  size = "md",
  className,
  loading = false,
  variant = "default",
  fullWidth = false,
  onClick,
  ...props
}: DoodleButtonProps) => {

  // Add debugging for button clicks
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('[DoodleButton] Button clicked:', children, 'disabled:', props.disabled);
    if (onClick) {
      onClick(e);
    }
  };
  // Map the doodle colors to neobrutalism colors
  const variantMap: Record<string, any> = {
    blue: "primary",
    green: "success",
    yellow: "warning",
    red: "destructive",
    purple: "secondary",
    pink: "accent",
    orange: "accent",
    default: "default",
    outline: "outline",
  };

  // Map size to NeoButton sizes
  const sizeMap: Record<string, any> = {
    sm: "sm",
    md: "md",
    lg: "lg",
  };

  // Determine the actual variant to use
  const buttonVariant = variant === "default" ? variantMap[color] : "outline";

  return (
    <NeoButton
      variant={buttonVariant}
      size={sizeMap[size]}
      loading={loading}
      icon={icon}
      fullWidth={fullWidth}
      className={cn(
        buttonVariant === "outline" && {
          "text-kid-blue": color === "blue",
          "text-kid-green": color === "green",
          "text-kid-yellow": color === "yellow",
          "text-kid-red": color === "red",
          "text-kid-purple": color === "purple",
          "text-kid-pink": color === "pink",
          "text-kid-orange": color === "orange",
        },
        className
      )}
      disabled={loading || props.disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </NeoButton>
  );
};

export default DoodleButton;
