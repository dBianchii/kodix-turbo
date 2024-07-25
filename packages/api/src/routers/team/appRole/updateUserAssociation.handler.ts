import { TRPCError } from "@trpc/server";

import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { and, eq, inArray } from "@kdx/db";
import { teamAppRoles, teamAppRolesToUsers } from "@kdx/db/schema";
import { appIdToAdminRole_defaultIdMap } from "@kdx/shared";

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

    if (input.userId === ctx.session.user.id) {
      //need to detect if they are sending the admin role to prevent removing themselves
      const adminTeamAppRolesForApp = await tx
        .select({ id: teamAppRoles.id })
        .from(teamAppRoles)
        .where(
          eq(
            teamAppRoles.appRoleDefaultId,
            appIdToAdminRole_defaultIdMap[input.appId],
          ),
        );

      if (
        !adminTeamAppRolesForApp.some((x) =>
          input.teamAppRoleIds.includes(x.id),
        )
      ) {
        throw new TRPCError({
          message: "You cannot remove yourself from the Administrator role",
          code: "BAD_REQUEST",
        });
      }
    }

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
