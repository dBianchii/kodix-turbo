"use client";

import { usePathname } from "next/navigation";
import { IoApps } from "react-icons/io5";

import type { AppPathnames } from "~/helpers/miscelaneous";
import { appPathnameToAppId } from "~/helpers/miscelaneous";
import { IconKodixApp } from "../app/kodix-icon";

export default function CurrentAppIcon({
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
