import type { TUpdatePermissionAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { inArray, schema } from "@kdx/db";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface UpdatePermissionAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdatePermissionAssociationInputSchema;
}

export const updatePermissionAssociationHandler = async ({
  ctx,
  input,
}: UpdatePermissionAssociationOptions) => {
  // const toDisconnect = await ctx.prisma.teamAppRole.findMany({
  //   where: {
  //     teamId: ctx.session.user.activeTeamId,
  //     appId: input.appId,
  //     NOT: {
  //       id: {
  //         in: input.teamAppRoleIds,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //   },
  // });
  const toDisconnect = await ctx.db.query.teamAppRoles.findMany({
    where: (teamAppRole, { eq, and, notInArray }) =>
      and(
        eq(teamAppRole.teamId, ctx.session.user.activeTeamId),
        eq(teamAppRole.appId, input.appId),
        notInArray(teamAppRole.id, input.teamAppRoleIds),
      ),
    columns: {
      id: true,
    },
  });

  // await ctx.prisma.appPermission.update({
  //   where: {
  //     id: input.permissionId,
  //   },
  //   data: {
  //     TeamAppRole: {
  //       disconnect: toDisconnect.map((role) => ({ id: role.id })),
  //       connect: input.teamAppRoleIds.map((appRoleId) => ({
  //         id: appRoleId,
  //       })),
  //     },
  //   },
  // });
  await ctx.db.transaction(async (tx) => {
    await tx.delete(schema.appPermissionsToTeamAppRoles).where(
      inArray(
        schema.teamAppRoles.id,
        toDisconnect.map((role) => role.id),
      ),
    );
    await tx.insert(schema.appPermissionsToTeamAppRoles).values(
      input.teamAppRoleIds.map((appRoleId) => ({
        appPermissionId: input.permissionId,
        teamAppRoleId: appRoleId,
      })),
    );
  });
};
