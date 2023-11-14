"use client";

import { usePathname } from "next/navigation";

export default function HeaderFooterRemover({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const blockedPaths = ["/signin"];

  if (blockedPaths.includes(pathname!)) {
    return null;
  }
  return <>{children}</>;
}
