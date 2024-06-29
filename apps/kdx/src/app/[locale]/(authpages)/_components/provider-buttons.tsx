import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { RxDiscordLogo } from "react-icons/rx";

import { cn } from "@kdx/ui";
import { buttonVariants } from "@kdx/ui/button";

export function GoogleSignIn({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={
        callbackUrl
          ? `/api/auth/google/login?callbackUrl=${callbackUrl}`
          : "/api/auth/google/login"
      }
    >
      <FcGoogle className="mr-2 size-4" />
      Google
    </Link>
  );
}
export function DiscordSignIn({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={
        callbackUrl
          ? `/api/auth/discord/login?callbackUrl=${callbackUrl}`
          : "/api/auth/discord/login"
      }
    >
      <RxDiscordLogo className="mr-2 size-4" />
      Discord
    </Link>
  );
}
