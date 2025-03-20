import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from ".";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning:
          "border-orange-500/50 bg-orange-100 text-orange-400 dark:border-orange-500 dark:bg-orange-950/50 [&>svg]:text-orange-400", //TODO: make orange css variables lol
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) => (
  <div
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
);

const AlertTitle = ({ className, ...props }: React.ComponentProps<"h5">) => (
  <h5
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
);

const AlertDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
);

export { Alert, AlertTitle, AlertDescription };
