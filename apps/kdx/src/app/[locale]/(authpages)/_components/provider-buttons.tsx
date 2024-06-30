import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { RxDiscordLogo } from "react-icons/rx";

import { getBaseKdxUrl } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { buttonVariants } from "@kdx/ui/button";

export function GoogleSignIn({
  callbackUrl,
  invite,
}: {
  callbackUrl?: string;
  invite?: string;
}) {
  const url = new URL("/api/auth/google/login", getBaseKdxUrl());
  if (invite) url.searchParams.append("invite", invite);
  if (callbackUrl) url.searchParams.append("callbackUrl", callbackUrl);

  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={url.href}
    >
      <FcGoogle className="mr-2 size-4" />
      Google
    </Link>
  );
}
export function DiscordSignIn({
  callbackUrl,
  invite,
}: {
  callbackUrl?: string;
  invite?: string;
}) {
  const url = new URL("/api/auth/google/login", getBaseKdxUrl());
  if (invite) url.searchParams.append("invite", invite);
  if (callbackUrl) url.searchParams.append("callbackUrl", callbackUrl);

  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={url.href}
    >
      <RxDiscordLogo className="mr-2 size-4" />
      Discord
    </Link>
  );
}
