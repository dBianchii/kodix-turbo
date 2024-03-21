import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq, inArray, schema } from "@kdx/db";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface UpdateUserAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdateUserAssociationInputSchema;
}

export const updateUserAssociationHandler = async ({
  ctx,
  input,
}: UpdateUserAssociationOptions) => {
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

  // await ctx.prisma.user.update({
  //   where: {
  //     id: input.userId,
  //     ActiveTeam: {
  //       id: ctx.session.user.activeTeamId,
  //     },
  //   },
  //   data: {
  //     TeamAppRole: {
  //       disconnect: toDisconnect.map((role) => ({ id: role.id })),
  //       connect: input.teamAppRoleIds.map((appRoleId) => ({
  //         id: appRoleId,
  //         teamId: ctx.session.user.activeTeamId,
  //         appId: input.appId,
  //       })),
  //     },
  //   },
  // });
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(schema.teamAppRolesToUsers)
      .where(
        inArray(
          schema.teamAppRolesToUsers.teamAppRoleId,
          ctx.db
            .select({ id: schema.teamAppRoles.id })
            .from(schema.teamAppRoles)
            .where(
              eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
            ),
        ),
      );
    if (input.teamAppRoleIds.length > 0)
      await tx.insert(schema.teamAppRolesToUsers).values(
        input.teamAppRoleIds.map((appRoleId) => ({
          userId: input.userId,
          teamAppRoleId: appRoleId,
        })),
      );
  });
};
