"use client";

import { cn } from "@kdx/ui";

import { usePathname } from "~/i18n/routing";

export function ShouldRender({
  children,
  endsWith,
}: {
  children: React.ReactNode;
  endsWith: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "hidden w-full md:block",
        pathname && !pathname.endsWith(endsWith) && "block",
      )}
    >
      {children}
    </div>
  );
}
