"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn, navigationMenuTriggerStyle, useMediaQuery } from "@kdx/ui";

export function SettingsNavigation({ url }: { url: string }) {
  const items = [
    {
      href: `/workspace/${url}/settings/general`,
      title: "General",
    },
    {
      href: `/workspace/${url}/settings/members`,
      title: "Members",
    },
  ];
  const pathname = usePathname();
  const matches = useMediaQuery({ query: "md" });

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center space-y-2 self-start md:w-min",
      )}
    >
      {!pathname!.endsWith("/settings") && !matches ? (
        <NavigationItem href={`/workspace/${url}/settings`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Settings
        </NavigationItem>
      ) : (
        items.map((item, i) => (
          <NavigationItem key={i} href={item.href}>
            {item.title}
          </NavigationItem>
        ))
      )}
    </div>
  );
}

function NavigationItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className={cn(
        navigationMenuTriggerStyle(),
        "w-full justify-start font-bold md:w-60",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
