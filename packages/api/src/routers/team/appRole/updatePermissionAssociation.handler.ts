import type { TUpdatePermissionAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface UpdatePermissionAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdatePermissionAssociationInputSchema;
}

export const updatePermissionAssociationHandler = async ({
  ctx,
  input,
}: UpdatePermissionAssociationOptions) => {
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
    select: {
      id: true,
    },
  });

  await ctx.prisma.appPermission.update({
    where: {
      id: input.permissionId,
    },
    data: {
      TeamAppRole: {
        disconnect: toDisconnect.map((role) => ({ id: role.id })),
        connect: input.teamAppRoleIds.map((appRoleId) => ({
          id: appRoleId,
        })),
      },
    },
  });
};
