"use client";

import type { KodixAppId } from "@kodix/shared/db";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
        alt={`${appName} icon`}
        height={size}
        src={appIconUrl}
        width={size}
      />
      {renderText && (
        <p className="line-clamp-1 text-muted-foreground text-sm">{appName}</p>
      )}
    </div>
  );
}
