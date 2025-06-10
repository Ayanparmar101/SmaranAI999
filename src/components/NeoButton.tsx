
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const neoButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 font-bold tracking-wide rounded-md text-center transition-all duration-200 border-3 border-black shadow-neo active:translate-y-1 active:shadow-none transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-gray-100",
        primary: "bg-[#0EA5E9] text-white hover:bg-[#0b95d3]",
        secondary: "bg-[#8B5CF6] text-white hover:bg-[#7c4df1]",
        accent: "bg-[#F97316] text-white hover:bg-[#e66a10]",
        destructive: "bg-[#EF4444] text-white hover:bg-[#dc2626]",
        success: "bg-[#10B981] text-white hover:bg-[#0ea271]",
        warning: "bg-[#F59E0B] text-white hover:bg-[#e8950a]",
        outline: "bg-transparent border-3 border-black hover:bg-gray-100",
      },
      size: {
        sm: "text-sm px-3 py-1.5 shadow-neo-sm min-h-[40px]",
        md: "text-base px-5 py-2.5 shadow-neo-md min-h-[44px]",
        lg: "text-lg px-6 py-3 shadow-neo-lg min-h-[48px]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface NeoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neoButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    asChild = false, 
    loading = false, 
    icon,
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(neoButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="https://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </div>
        )}
      </Comp>
    );
  }
);

NeoButton.displayName = "NeoButton";

export { NeoButton, neoButtonVariants };
