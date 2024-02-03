import { revalidateTag } from "next/cache";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TUninstallAppSchema } from "@kdx/validators/trpc/team";

interface UninstallAppOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TUninstallAppSchema;
}

export const uninstallAppHandler = async ({
  ctx,
  input,
}: UninstallAppOptions) => {
  const uninstalledApp = await ctx.prisma.team.update({
    where: {
      id: ctx.session.user.activeTeamId,
    },
    data: {
      ActiveApps: {
        disconnect: {
          id: input.appId,
        },
      },
    },
  });
  revalidateTag("getAllForLoggedUser");

  return uninstalledApp;
};
