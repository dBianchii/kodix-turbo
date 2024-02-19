import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface UpdateUserAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdateUserAssociationInputSchema;
}

export const updateUserAssociationHandler = async ({
  ctx,
  input,
}: UpdateUserAssociationOptions) => {
  const toDisconnect = await ctx.prisma.teamAppRole.findMany({
    where: {
      teamId: ctx.session.user.activeTeamId,
      appId: input.appId,
      NOT: {
        id: {
          in: input.teamAppRoleIds,
        },
      },
    },
  });

  await ctx.prisma.user.update({
    where: {
      id: input.userId,
      ActiveTeam: {
        id: ctx.session.user.activeTeamId,
      },
    },
    data: {
      TeamAppRole: {
        disconnect: toDisconnect.map((role) => ({ id: role.id })),
        connect: input.teamAppRoleIds.map((appRoleId) => ({
          id: appRoleId,
          teamId: ctx.session.user.activeTeamId,
          appId: input.appId,
        })),
      },
    },
  });
};
