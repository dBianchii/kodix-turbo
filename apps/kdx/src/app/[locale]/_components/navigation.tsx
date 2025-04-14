"use client";

import { LuArrowLeft } from "react-icons/lu";

import { cn } from "@kdx/ui";
import { useMediaQuery } from "@kdx/ui/hooks/use-media-query";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@kdx/ui/navigation-menu/index";
import { navigationMenuTriggerStyle } from "@kdx/ui/navigation-menu/navigationMenuTriggerStyle";

import { Link, usePathname } from "~/i18n/routing";

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
    shown?: boolean;
  }[];
}) {
  const pathname = usePathname();
  const isSmallerScreen = useMediaQuery({ query: "md" });
  const entryPoint = goBackItem.href.split("/").at(-1);
  if (!entryPoint) throw new Error("Your goBackItem.href is invalid");

  items = items.filter((item) => item.shown !== false);

  return (
    <NavigationMenu className="flex w-full max-w-4xl self-start">
      <NavigationMenuList className={cn("flex w-full flex-col space-y-2")}>
        {!pathname.endsWith(entryPoint) && !isSmallerScreen ? (
          <NavigationItem href={goBackItem.href}>
            <LuArrowLeft className="mr-2 size-4" /> {goBackItem.title}
          </NavigationItem>
        ) : (
          items.map((item, i) => (
            <NavigationItem key={i} href={item.href}>
              {item.title}
            </NavigationItem>
          ))
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function NavigationItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        active={pathname === href}
        className={cn(
          navigationMenuTriggerStyle(),
          "justify-start text-center font-bold md:w-60",
        )}
      >
        <Link href={href}>{children}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}
