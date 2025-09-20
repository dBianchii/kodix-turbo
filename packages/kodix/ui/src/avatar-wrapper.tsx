//? Not a ShadCN file. I added this to simplify the fallback

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export const AvatarWrapper = ({
  ref,
  src,
  fallback,
  className,
  ...props
}: React.ComponentProps<typeof AvatarImage> & {
  fallback?: React.ReactNode;
}) => (
  <Avatar className={className} ref={ref}>
    <AvatarImage src={src} {...props} />
    {fallback && (
      <AvatarFallback>
        {typeof fallback === "string"
          ? fallback
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : fallback}
      </AvatarFallback>
    )}
  </Avatar>
);
