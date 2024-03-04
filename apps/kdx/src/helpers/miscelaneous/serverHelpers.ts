import { redirect } from "next/navigation";

import type { PrismaClient } from "@kdx/db";
import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";

/**
 * @description Sees if user has this app on current team, if not, redirects to /apps
 */
export const redirectIfAppNotInstalled = async ({
  appId,
  prisma,
  customRedirect,
}: {
  appId: KodixAppId;
  prisma: PrismaClient;
  customRedirect?: string;
}) => {
  const session = await auth();
  if (!session) redirect("/");

  const installed = await prisma.app.findUnique({
    where: {
      id: appId,
      Teams: {
        some: {
          id: session.user.activeTeamId,
        },
      },
    },
    select: {
      id: true,
    },
  });
  if (!installed) redirect(customRedirect ?? "/apps");

  return session;
};
