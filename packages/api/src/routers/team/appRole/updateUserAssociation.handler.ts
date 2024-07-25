import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { and, eq, inArray } from "@kdx/db";
import { teamAppRoles, teamAppRolesToUsers } from "@kdx/db/schema";

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
      .select({ id: teamAppRoles.id })
      .from(teamAppRoles)
      .where(
        and(
          eq(teamAppRoles.appId, input.appId),
          eq(teamAppRoles.teamId, ctx.session.user.activeTeamId),
        ),
      );

    await tx
      .delete(teamAppRolesToUsers)
      .where(
        and(
          eq(teamAppRolesToUsers.userId, input.userId),
          inArray(
            teamAppRolesToUsers.teamAppRoleId,
            teamAppRolesForTeamAndAppQuery,
          ),
        ),
      );

    if (input.teamAppRoleIds.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await tx.insert(teamAppRolesToUsers).values(
        input.teamAppRoleIds.map((appRoleId) => ({
          userId: input.userId,
          teamAppRoleId: appRoleId,
        })),
      );
  });
};
