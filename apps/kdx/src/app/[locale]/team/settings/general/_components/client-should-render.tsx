"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@kdx/ui/utils";

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
