"use client";

import { usePathname } from "next/navigation";
import { IoApps } from "react-icons/io5";

import type { KodixAppId } from "@kdx/shared";

import { appIdToPathname } from "~/helpers/miscelaneous";
import { IconKodixApp } from "../app/kodix-app";

export default function CurrentAppIcon() {
  const pathname = usePathname();

  if (pathname.includes("/apps/")) {
    //get the pathname of the current app
    const currentAppPathname = pathname.split("/apps/")[1]?.split("/")[0];
    if (!currentAppPathname)
      throw new Error("Could not get current app pathname");

    //reverse the appIdToPathname object
    const appPathnameToId = Object.fromEntries(
      Object.entries(appIdToPathname).map(([key, value]) => [value, key]),
    );

    const currentAppId = appPathnameToId[currentAppPathname] as KodixAppId;
    return <IconKodixApp appId={currentAppId} size={20} renderText={false} />;
  }

  return <IoApps className={"h-4 w-4"} />;
}
