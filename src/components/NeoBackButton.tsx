
import React from "react";
import { ArrowLeft } from "lucide-react";
import { NeoButton } from "@/components/NeoButton";

interface NeoBackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  color?: "blue" | "purple" | "green" | "yellow" | "red" | "orange";
}

const NeoBackButton = ({
  label = "Back",
  color = "blue",
  ...props
}: NeoBackButtonProps) => {
  // Map the doodle colors to neobrutalism colors
  const variantMap: Record<string, any> = {
    blue: "primary",
    green: "success",
    yellow: "warning",
    red: "destructive",
    purple: "secondary",
    orange: "accent",
  };

  return (
    <NeoButton
      variant={variantMap[color]}
      size="md"
      icon={<ArrowLeft size={20} />}
      className="mb-6"
      {...props}
    >
      {label}
    </NeoButton>
  );
};

export default NeoBackButton;
