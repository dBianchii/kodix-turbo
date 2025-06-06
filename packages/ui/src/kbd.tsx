import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from ".";

const kbdVariants = cva(
  "rounded-sm border px-1.5 py-px font-mono text-[0.7rem] font-normal shadow-2xs select-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        outline: "bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
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
}: KbdProps) => {
  return (
    <kbd className={cn(kbdVariants({ variant, className }))} {...props}>
      {abbrTitle ? (
        <abbr title={abbrTitle} className="no-underline">
          {children}
        </abbr>
      ) : (
        children
      )}
    </kbd>
  );
};

export { Kbd };
