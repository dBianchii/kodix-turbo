"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { IoApps } from "react-icons/io5";
import { LuChevronsUpDown, LuCirclePlus } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import { getAppName } from "@kdx/locales/next-intl/hooks";
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
import { Link, usePathname, useRouter } from "~/i18n/routing";

import { IconKodixApp } from "../app/kodix-icon";

export function AppSwitcherClient({
  iconSize = 20,
  hideAddMoreApps = false,
  hrefPrefix,
  appsPromise,
}: {
  iconSize?: number;
  hideAddMoreApps?: boolean;
  hrefPrefix?: string;
  appsPromise: Promise<RouterOutputs["app"]["getInstalled"]>;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const apps = use(appsPromise);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="justify-start">
          <CurrentAppIcon hrefPrefix={hrefPrefix} iconSize={iconSize} />
          <span className="ml-2">
            <CurrentAppName hrefPrefix={hrefPrefix} />
          </span>
          <LuChevronsUpDown className="ml-4 h-4 w-4 shrink-0 opacity-50" />
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
                ? `${hrefPrefix}/${appIdToPathname[app.id]}`
                : getAppUrl(app.id);

              const appName = getAppName(app.id, t);
              return (
                <Link href={link} key={app.id} passHref>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      router.push(link);
                    }}
                  >
                    <IconKodixApp
                      appId={app.id}
                      renderText={false}
                      size={iconSize}
                    />
                    <span className="ml-2">{appName}</span>
                  </CommandItem>
                </Link>
              );
            })}
            {!hideAddMoreApps && (
              <Link href={"/apps"}>
                <CommandItem onSelect={() => setOpen(false)}>
                  <LuCirclePlus className="size-4" />
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
  const t = useTranslations();
  const appName = getAppName(currentAppId, t);

  if (pathname.includes(hrefPrefix)) {
    if (!currentAppPathname)
      throw new Error("Could not get current app pathname");

    return <>{appName}</>;
  }

  return null;
}
