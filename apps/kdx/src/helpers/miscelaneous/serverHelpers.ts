import { redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";

/**
 * @description Checks if user is logged in and has this app on current team. If not, redirects to /apps
 * @returns session
 */
export const redirectIfAppNotInstalled = async ({
  appId,
  customRedirect,
}: {
  appId: KodixAppId;
  customRedirect?: string;
}) => {
  const session = await auth();
  if (!session) redirect("/");
  const installedApps = await api.app.getInstalled();

  if (!installedApps.some((x) => x.id === appId))
    redirect(customRedirect ?? "/apps");

  return session;
};
