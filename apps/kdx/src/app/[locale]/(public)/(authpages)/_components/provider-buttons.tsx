import { FcGoogle } from "react-icons/fc";
import { RxDiscordLogo } from "react-icons/rx";

import { env } from "@kdx/env";
import { getBaseUrl } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { buttonVariants } from "@kdx/ui/button";

const providers = [
  {
    icon: <FcGoogle className="mr-2 size-4" />,
    name: "Google",
  },
  {
    icon: <RxDiscordLogo className="mr-2 size-4" />,
    name: "Discord",
    shown: env.NODE_ENV === "development",
  },
].filter((p) => p.shown !== false);

export function ProviderButtons({
  callbackUrl,
  invite,
}: {
  callbackUrl?: string;
  invite?: string;
}) {
  return (
    <>
      {providers.map((provider) => (
        <a
          key={provider.name}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          href={getProviderUrl(provider.name, callbackUrl, invite)}
        >
          {provider.icon}
          {provider.name}
        </a>
      ))}
    </>
  );
}

function getProviderUrl(
  provider: string,
  callbackUrl?: string,
  invite?: string,
): string {
  const url = new URL(
    `/api/auth/${provider.toLowerCase()}/login`,
    getBaseUrl(),
  );
  if (invite) url.searchParams.append("invite", invite);
  if (callbackUrl) url.searchParams.append("callbackUrl", callbackUrl);
  return url.href;
}
