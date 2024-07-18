import { TRPCError } from "@trpc/server";

import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";
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
    if (input.userId === ctx.session.user.id) {
      //need to detect if they are sending the admin role to prevent removing themselves
      const adminTeamAppRolesForApp = await tx
        .select({ id: schema.teamAppRoles.id })
        .from(schema.teamAppRoles)
        .where(
          eq(
            schema.teamAppRoles.appRoleDefaultId,
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
      .delete(schema.teamAppRolesToUsers)
      .where(eq(schema.teamAppRolesToUsers.userId, input.userId));

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
