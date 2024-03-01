import type { TGetPermissionsInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface GetPermissionsOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetPermissionsInputSchema;
}

export const getPermissionsHandler = async ({
  ctx,
  input,
}: GetPermissionsOptions) => {
  return await ctx.prisma.appPermission.findMany({
    where: {
      appId: input.appId,
      TeamAppRole: {
        some: {
          teamId: ctx.session.user.activeTeamId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      TeamAppRole: {
        select: {
          id: true,
        },
        where: {
          teamId: ctx.session.user.activeTeamId,
        },
      },
    },
  });
};
