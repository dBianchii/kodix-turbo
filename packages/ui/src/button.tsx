import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from ".";

const buttonVariants = cva(
  "focus-visible:ring-ring inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-2xs",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border shadow-2xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-2xs",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        orange:
          "text-destructive-foreground bg-orange-600 shadow-2xs hover:bg-orange-600/90", //TODO: Create orange CSS variable!
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = ({
  ref,
  className,
  variant,
  size,
  children,
  asChild = false,
  disabled,
  loading = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      ref={ref}
      {...props}
    >
      {loading && (
        <Loader2
          className="-ms-1 me-2 animate-spin"
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
      {children}
    </Comp>
  );
};

export { Button, buttonVariants };
