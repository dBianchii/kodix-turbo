import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from ".";

const badgeVariants = cva(
  "focus:ring-ring  items-center inline-flex rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
  {
    variants: {
      variant: {
        green:
          "border-transparent text-primary-foreground bg-green-700 shadow-xs hover:bg-green-800", //TODO: Create green CSS variable!
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent shadow-xs",
        secondary:
          "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent shadow-xs",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
