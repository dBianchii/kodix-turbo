import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { and, eq, inArray } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdateUserAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdateUserAssociationInputSchema;
}

export const updateUserAssociationHandler = async ({
  ctx,
  input,
}: UpdateUserAssociationOptions) => {
  await ctx.db.transaction(async (tx) => {
    const teamAppRolesForTeamAndAppQuery = tx
      .select({ id: schema.teamAppRoles.id })
      .from(schema.teamAppRoles)
      .where(
        and(
          eq(schema.teamAppRoles.appId, input.appId),
          eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
        ),
      );

    await tx
      .delete(schema.teamAppRolesToUsers)
      .where(
        and(
          eq(schema.teamAppRolesToUsers.userId, input.userId),
          inArray(
            schema.teamAppRolesToUsers.teamAppRoleId,
            teamAppRolesForTeamAndAppQuery,
          ),
        ),
      );

    if (input.teamAppRoleIds.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await tx.insert(schema.teamAppRolesToUsers).values(
        input.teamAppRoleIds.map((appRoleId) => ({
          userId: input.userId,
          teamAppRoleId: appRoleId,
        })),
      );
  });
};
