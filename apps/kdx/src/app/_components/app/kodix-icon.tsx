import Image from "next/image";
import Link from "next/link";

import type { KodixAppId } from "@kdx/shared";
import { getAppName } from "@kdx/shared";

import { getAppIconUrl } from "~/helpers/miscelaneous";

export function IconKodixApp({
  renderText = true,
  size = 80,
  ...props
}: {
  appId: KodixAppId;
  renderText?: boolean;
  size?: number;
}) {
  const appIconUrl = getAppIconUrl(props.appId);
  const appName = getAppName(props.appId);

  return (
    <>
      <Image
        src={appIconUrl}
        height={size}
        width={size}
        alt={`${appName} icon`}
      />
      {renderText && <p className="text-sm text-muted-foreground">{appName}</p>}
    </>
  );
}

export function CustomKodixIcon({
  renderText = true,
  ...props
}: {
  appUrl: string;
  appName: string;
  renderText?: boolean;
  iconPath: string;
}) {
  return (
    <Link href={props.appUrl} className="flex flex-col items-center">
      <Image
        src={props.iconPath}
        height={"80"}
        width={"80"}
        alt={`${props.appName} icon`}
      />
      {renderText && (
        <p className="text-sm text-muted-foreground">{props.appName}</p>
      )}
    </Link>
  );
}
