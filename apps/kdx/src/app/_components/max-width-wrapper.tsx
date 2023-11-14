import type { ReactNode } from "react";

import { cn } from "@kdx/ui";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-8", className)}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
