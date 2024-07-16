import React from "react";
import type { AvatarProps } from "tamagui";
import { Avatar, Text } from "tamagui";

export function AvatarWrapper({
  src,
  fallback,
  ...props
}: AvatarProps & {
  src?: string | null;
  fallback?: React.ReactNode;
}) {
  return (
    <Avatar circular size={"$5"} {...props} bordered>
      {src && <Avatar.Image src={src} />}
      {fallback && (
        <Avatar.Fallback ai="center" jc="center">
          <Text color={"$gray12Dark"}>
            {typeof fallback === "string"
              ? fallback
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : fallback}
          </Text>
        </Avatar.Fallback>
      )}
      <Avatar.Fallback backgroundColor="$blue10" />
    </Avatar>
  );
}
