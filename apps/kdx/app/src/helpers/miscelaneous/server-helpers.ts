import type { KodixAppId } from "@kodix/shared/db";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { getLocaleBasedOnCookie } from "@kdx/api/utils/locales";
import { auth } from "@kdx/auth";

import { redirect } from "~/i18n/routing";

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

  if (!installedApps.some((x) => x.id === appId))
    return redirect({
      href: customRedirect ?? "/apps",
      locale: await getLocaleBasedOnCookie(),
    });

  return user;
};
