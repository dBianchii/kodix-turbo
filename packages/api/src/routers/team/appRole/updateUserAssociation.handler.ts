import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { inArray, schema } from "@kdx/db";

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
    await tx.delete(schema.teamAppRolesToUsers).where(
      inArray(
        schema.teamAppRoles.id,
        toDisconnect.map((role) => role.id),
      ),
    );
    await tx.insert(schema.teamAppRolesToUsers).values(
      input.teamAppRoleIds.map((appRoleId) => ({
        userId: input.userId,
        teamAppRoleId: appRoleId,
      })),
    );
  });
};
