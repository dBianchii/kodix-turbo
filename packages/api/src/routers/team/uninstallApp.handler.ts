import { revalidateTag } from "next/cache";

import type { TUninstallAppSchema } from "@kdx/validators/trpc/team";

import type { TProtectedProcedureContext } from "../../trpc";

interface UninstallAppOptions {
  ctx: TProtectedProcedureContext;
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
      TeamAppRoles: {
        deleteMany: {
          appId: input.appId,
        },
      },
    },
  });

  //TODO: remove all data from the app.

  revalidateTag("getAllForLoggedUser");

  return uninstalledApp;
};
