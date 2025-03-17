"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import type { KodixAppId } from "@kdx/shared";
import { getAppName } from "@kdx/locales/next-intl/hooks";

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
  const t = useTranslations();
  const appName = getAppName(props.appId, t);

  return (
    <div className="flex flex-col items-center">
      <Image
        src={appIconUrl}
        height={size}
        width={size}
        alt={`${appName} icon`}
      />
      {renderText && (
        <p className="text-muted-foreground line-clamp-1 text-sm">{appName}</p>
      )}
    </div>
  );
}
