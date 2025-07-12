import { getLocaleBasedOnCookie } from "node_modules/@kdx/api/src/utils/locales";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";

import { redirect } from "~/i18n/routing";
import { trpcCaller } from "~/trpc/server";

/**
 * @description Checks if user is logged in and has this app on current team. If not, redirects to /apps
 * @returns user
 */
export const redirectIfAppNotInstalled = async ({
  appId,
  customRedirect,
}: {
  appId: KodixAppId;
  customRedirect?: string;
}) => {
  const { user } = await auth();
  if (!user)
    return redirect({
      href: "/",
      locale: await getLocaleBasedOnCookie(),
    });
  const installedApps = await trpcCaller.app.getInstalled();

  if (!installedApps.some((x: any) => x.id === appId))
    return redirect({
      href: customRedirect ?? "/apps",
      locale: await getLocaleBasedOnCookie(),
    });

  return user;
};
