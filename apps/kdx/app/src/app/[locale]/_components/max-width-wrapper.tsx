import type { ReactNode } from "react";
import { cn } from "@kodix/ui/lib/utils";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "mx-auto w-full max-w-(--breakpoint-2xl) px-2.5 md:px-8",
      className,
    )}
  >
    {children}
  </div>
);

export default MaxWidthWrapper;
