import Link from "next/link";
import { RxPlusCircled } from "react-icons/rx";

import type { KodixAppId } from "@kdx/shared";
import { getAppName } from "@kdx/shared";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@kdx/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@kdx/ui/navigationMenuTriggerStyle";
import { cn } from "@kdx/ui/utils";

import { appIdToPathname, getAppUrl } from "~/helpers/miscelaneous";
import { api } from "~/trpc/server";
import { IconKodixApp } from "../app/kodix-icon";
import CurrentAppIcon from "./current-app-icon";

export async function AppSwitcher({
  iconSize = 20,
  hideAddMoreApps = false,
  hrefPrefix,
}: {
  iconSize?: number;
  hideAddMoreApps?: boolean;
  hrefPrefix?: string;
}) {
  const apps = await api.app.getInstalled();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-fit">
            <CurrentAppIcon hrefPrefix={hrefPrefix} iconSize={iconSize} />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex flex-col">
              {apps.map((app) => (
                <NavigationMenuItem
                  className="flex w-full flex-row"
                  key={app.id}
                >
                  <Link
                    href={
                      hrefPrefix
                        ? `${hrefPrefix}/${appIdToPathname[app.id as KodixAppId]}`
                        : getAppUrl(app.id as KodixAppId)
                    }
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "py-6, w-44 justify-start p-4",
                      )}
                    >
                      <IconKodixApp
                        appId={app.id as KodixAppId}
                        renderText={false}
                        size={28}
                      />
                      <p className="ml-4">{getAppName(app.id as KodixAppId)}</p>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              {!hideAddMoreApps && (
                <NavigationMenuItem className="flex w-full flex-row">
                  <Link href={"/apps"} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "py-6, w-44 justify-start p-4",
                      )}
                    >
                      <RxPlusCircled className="ml-2 h-4 w-4" />
                      <p className="ml-4">Add more apps</p>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
