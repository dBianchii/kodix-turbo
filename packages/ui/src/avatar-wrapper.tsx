//? Not a ShadCN file. I added this to simplify the fallback

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export const AvatarWrapper = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentProps<typeof AvatarImage> & { fallback?: React.ReactNode }
>(({ src, fallback, className, ...props }, ref) => (
  <Avatar ref={ref} className={className}>
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
));
