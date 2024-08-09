"use client";

import { usePathname } from "@kdx/locales/next-intl/navigation";

export default function HeaderFooterRemover({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const blockedPaths = ["/signin", "/signup", "forgot-password"];

  if (blockedPaths.some((bp) => new RegExp(bp).test(pathname))) {
    return null;
  }
  return <>{children}</>;
}
