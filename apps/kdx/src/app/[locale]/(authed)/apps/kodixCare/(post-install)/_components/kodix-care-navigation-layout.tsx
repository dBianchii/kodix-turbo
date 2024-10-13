"use client";

import { useEffect, useState } from "react";
import { LuCog, LuHome, LuMenu } from "react-icons/lu";

import { useTranslations } from "@kdx/locales/next-intl/client";
import { Link, usePathname } from "@kdx/locales/next-intl/navigation";
import { kodixCareAppId } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@kdx/ui/sheet";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";

export function KodixCareNavigationLayout() {
  const t = useTranslations();
  const pathname = usePathname();

  const kodixCareNavItems = [
    { href: "/apps/kodixCare", icon: LuHome, text: t("Main page") },
    { href: "/apps/kodixCare/settings", icon: LuCog, text: t("Settings") },
  ];

  return (
    <>
      <div className="flex items-end gap-2 font-semibold">
        <IconKodixApp appId={kodixCareAppId} renderText={false} size={35} />
        <span>{t("Kodix Care")}</span>
      </div>
      <nav className="items-start pr-2 pt-4 text-sm font-medium">
        {kodixCareNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 pr-6 transition-all hover:text-foreground",
              { "text-muted-foreground": pathname !== item.href },
              { "bg-muted": pathname === item.href },
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.text}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function NavigationSheet() {
  const [open, setOpen] = useState(false);

  const pathName = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathName]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <LuMenu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex max-w-screen-sm flex-col">
        <KodixCareNavigationLayout />
      </SheetContent>
    </Sheet>
  );
}
