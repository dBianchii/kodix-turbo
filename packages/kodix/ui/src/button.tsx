import type { VariantProps } from "class-variance-authority";
import { cn } from "@kodix/ui/lib/utils";
import { Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2",
        icon: "h-9 w-9",
        lg: "h-10 rounded-md px-8",
        sm: "h-8 rounded-md px-3 text-xs",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-2xs hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        orange:
          "bg-orange-600 text-destructive-foreground shadow-2xs hover:bg-orange-600/90", //TODO: Create orange CSS variable!
        outline:
          "border border-input bg-background shadow-2xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80",
      },
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
  const Comp = asChild ? SlotPrimitive.Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      disabled={loading || disabled}
      ref={ref}
      {...props}
    >
      {loading && (
        <Loader2
          aria-hidden="true"
          className="-ms-1 me-2 animate-spin"
          size={16}
          strokeWidth={2}
        />
      )}
      <Slottable>{children}</Slottable>
    </Comp>
  );
};

export { Button, buttonVariants };
