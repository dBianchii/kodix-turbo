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
        alt={`${props.appName} icon`}
        height={size}
        src={props.iconPath}
        width={size}
      />
      {renderText && (
        <p className="line-clamp-1 text-muted-foreground text-sm">
          {props.appName}
        </p>
      )}
    </div>
  );
}
