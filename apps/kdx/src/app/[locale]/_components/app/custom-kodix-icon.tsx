import Image from "next/image";

import { defaultSize } from "./kodix-icon";

export function CustomKodixIcon({
  renderText = true,
  size = defaultSize,
  ...props
}: {
  appName: string;
  renderText?: boolean;
  iconPath: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <Image
        src={props.iconPath}
        height={size}
        width={size}
        alt={`${props.appName} icon`}
      />
      {renderText && (
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {props.appName}
        </p>
      )}
    </div>
  );
}
