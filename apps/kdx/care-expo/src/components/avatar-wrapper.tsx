import type { AvatarProps } from "@tamagui/avatar";
import { Avatar } from "@tamagui/avatar";
import { Text } from "@tamagui/core";

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
        <Avatar.Fallback ai="center" backgroundColor="$color2" jc="center">
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
    </Avatar>
  );
}
