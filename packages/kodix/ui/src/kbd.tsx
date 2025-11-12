import type { VariantProps } from "class-variance-authority";
import { cn } from "@kodix/ui/lib/utils";
import { cva } from "class-variance-authority";

const kbdVariants = cva(
  "select-none rounded-sm border px-1.5 py-px font-mono font-normal text-[0.7rem] shadow-2xs disabled:opacity-50",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        outline: "bg-background text-foreground",
      },
    },
  },
);

export interface KbdProps
  extends React.ComponentProps<"kbd">,
    VariantProps<typeof kbdVariants> {
  /**
   * The title of the `abbr` element inside the `kbd` element.
   * @default undefined
   * @type string | undefined
   * @example title="Command"
   */
  abbrTitle?: string;
}

const Kbd = ({
  abbrTitle,
  children,
  className,
  variant,
  ...props
}: KbdProps) => (
  <kbd className={cn(kbdVariants({ className, variant }))} {...props}>
    {abbrTitle ? (
      <abbr className="no-underline" title={abbrTitle}>
        {children}
      </abbr>
    ) : (
      children
    )}
  </kbd>
);

export { Kbd };
