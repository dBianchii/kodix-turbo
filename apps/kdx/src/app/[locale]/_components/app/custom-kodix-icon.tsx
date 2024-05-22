import Image from "next/image";
import Link from "next/link";

import { defaultSize } from "./kodix-icon";

export function CustomKodixIcon({
  renderText = true,
  size = defaultSize,
  ...props
}: {
  appUrl: string;
  appName: string;
  renderText?: boolean;
  iconPath: string;
  size?: number;
}) {
  return (
    <Link href={props.appUrl} className="flex flex-col items-center">
      <Image
        src={props.iconPath}
        height={size}
        width={size}
        alt={`${props.appName} icon`}
      />
      {renderText && (
        <p className="text-sm text-muted-foreground">{props.appName}</p>
      )}
    </Link>
  );
}
