import type { ReactNode } from "react";

import { cn } from "@kdx/ui/utils";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-2xl px-2.5 md:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
