"use client";

import { usePathname } from "next/navigation";

export default function HeaderFooterRemover({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const blockedPaths = ["/signin", "/signup"];

  if (blockedPaths.some((bp) => pathname.endsWith(bp))) {
    return null;
  }
  return <>{children}</>;
}
