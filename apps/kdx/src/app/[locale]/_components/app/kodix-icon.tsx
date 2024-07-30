"use client";

import Image from "next/image";

import type { KodixAppId } from "@kdx/shared";
import { useAppName } from "@kdx/locales/next-intl/hooks";

import { getAppIconUrl } from "~/helpers/miscelaneous";

export const defaultSize = 70;
export function IconKodixApp({
  renderText = true,
  size = defaultSize,
  ...props
}: {
  appId: KodixAppId;
  renderText?: boolean;
  size?: number;
}) {
  const appIconUrl = getAppIconUrl(props.appId);
  const appName = useAppName(props.appId);

  return (
    <div className="flex flex-col items-center">
      <Image
        src={appIconUrl}
        height={size}
        width={size}
        alt={`${appName} icon`}
      />
      {renderText && <p className="text-sm text-muted-foreground">{appName}</p>}
    </div>
  );
}
