"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RxArrowLeft } from "react-icons/rx";

import { navigationMenuTriggerStyle } from "@kdx/ui/navigationMenuTriggerStyle";
import { cn, useMediaQuery } from "@kdx/ui/utils";

export function Navigation({
  goBackItem,
  items,
}: {
  goBackItem: {
    href: string;
    title: string;
  };
  items: {
    href: string;
    title: string;
  }[];
}) {
  const pathname = usePathname();
  const matches = useMediaQuery({ query: "md" });
  const entryPoint = goBackItem.href.split("/").at(-1);
  if (!entryPoint) throw new Error("Your goBackItem.href is invalid");

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center space-y-2 self-start md:w-min",
      )}
    >
      {!pathname.endsWith(entryPoint) && !matches ? (
        <NavigationItem href={goBackItem.href}>
          <RxArrowLeft className="mr-2 h-4 w-4" /> {goBackItem.title}
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
