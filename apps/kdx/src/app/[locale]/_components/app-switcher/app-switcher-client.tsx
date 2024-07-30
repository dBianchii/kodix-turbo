"use client";

import { useState } from "react";
import Link from "next/link";
import { IoApps } from "react-icons/io5";
import { RxCaretSort, RxCheck, RxPlusCircled } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { KodixAppId } from "@kdx/shared";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { useAppName } from "@kdx/locales/next-intl/hooks";
import { usePathname, useRouter } from "@kdx/locales/next-intl/navigation";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

import type { AppPathnames } from "~/helpers/miscelaneous";
import {
  appIdToPathname,
  appPathnameToAppId,
  getAppUrl,
} from "~/helpers/miscelaneous";
import { IconKodixApp } from "../app/kodix-icon";

export function AppSwitcherClient({
  iconSize = 20,
  hideAddMoreApps = false,
  hrefPrefix,
  apps,
}: {
  iconSize?: number;
  hideAddMoreApps?: boolean;
  hrefPrefix?: string;
  apps: RouterOutputs["app"]["getInstalled"];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" role="combobox" className="justify-start">
          <CurrentAppIcon hrefPrefix={hrefPrefix} iconSize={iconSize} />
          <span className="ml-2">
            <CurrentAppName hrefPrefix={hrefPrefix} />
          </span>
          <RxCaretSort className="ml-4 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`${t("header.Search app")}...`}
            className="h-9"
          />
          <CommandEmpty>{t("No apps found")}</CommandEmpty>
          <CommandGroup>
            {apps.map((app) => {
              const link = hrefPrefix
                ? `${hrefPrefix}/${appIdToPathname[app.id as KodixAppId]}`
                : getAppUrl(app.id as KodixAppId);
              return (
                <Link href={link} key={app.id} passHref>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      router.push(link);
                    }}
                  >
                    <IconKodixApp
                      appId={app.id as KodixAppId}
                      renderText={false}
                      size={iconSize}
                    />
                    <span className="ml-2">
                      <AppName appId={app.id as KodixAppId} />
                    </span>
                    <RxCheck
                      className={cn(
                        "ml-auto h-4 w-4",
                        "value" === app.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                </Link>
              );
            })}
            {!hideAddMoreApps && (
              <Link href={"/apps"}>
                <CommandItem onSelect={() => setOpen(false)}>
                  <RxPlusCircled className="size-4" />
                  <span className="ml-3">{t("Add more apps")}</span>
                </CommandItem>
              </Link>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AppName({ appId }: { appId: KodixAppId }) {
  //Had to create this component because of the rules of hooks
  return useAppName(appId);
}

function CurrentAppIcon({
  hrefPrefix = "/apps/",
  iconSize,
}: {
  hrefPrefix?: string;
  iconSize: number;
}) {
  const pathname = usePathname();

  if (pathname.includes(hrefPrefix)) {
    //get the pathname of the current app
    const currentAppPathname = pathname.split(hrefPrefix)[1]?.split("/")[0];
    if (!currentAppPathname)
      throw new Error("Could not get current app pathname");

    const currentAppId = appPathnameToAppId[currentAppPathname as AppPathnames];
    return (
      <IconKodixApp appId={currentAppId} size={iconSize} renderText={false} />
    );
  }

  return <IoApps size={iconSize} className="text-muted-foreground" />;
}

function CurrentAppName({ hrefPrefix = "/apps/" }: { hrefPrefix?: string }) {
  const pathname = usePathname();
  const currentAppPathname = pathname.split(hrefPrefix)[1]?.split("/")[0];

  const currentAppId = appPathnameToAppId[currentAppPathname as AppPathnames];
  const appName = useAppName(currentAppId);

  if (pathname.includes(hrefPrefix)) {
    if (!currentAppPathname)
      throw new Error("Could not get current app pathname");

    return <>{appName}</>;
  }

  return null;
}
