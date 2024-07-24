import type { TUpdatePermissionAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq, inArray } from "@kdx/db";
import { appPermissionsToTeamAppRoles, teamAppRoles } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdatePermissionAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdatePermissionAssociationInputSchema;
}

export const updatePermissionAssociationHandler = async ({
  ctx,
  input,
}: UpdatePermissionAssociationOptions) => {
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(appPermissionsToTeamAppRoles)
      .where(
        inArray(
          appPermissionsToTeamAppRoles.teamAppRoleId,
          ctx.db
            .select({ id: teamAppRoles.id })
            .from(teamAppRoles)
            .where(eq(teamAppRoles.teamId, ctx.session.user.activeTeamId)),
        ),
      );
    if (input.teamAppRoleIds.length > 0)
      await tx.insert(appPermissionsToTeamAppRoles).values(
        input.teamAppRoleIds.map((id) => ({
          teamAppRoleId: id,
          appPermissionId: input.permissionId,
        })),
      );
  });
};
