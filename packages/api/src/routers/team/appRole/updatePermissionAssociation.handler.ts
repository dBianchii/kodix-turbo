import type { TUpdatePermissionAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq, inArray, schema } from "@kdx/db";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

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
      .delete(schema.appPermissionsToTeamAppRoles)
      .where(
        inArray(
          schema.appPermissionsToTeamAppRoles.teamAppRoleId,
          ctx.db
            .select({ id: schema.teamAppRoles.id })
            .from(schema.teamAppRoles)
            .where(
              eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
            ),
        ),
      );
    if (input.teamAppRoleIds.length > 0)
      await tx.insert(schema.appPermissionsToTeamAppRoles).values(
        input.teamAppRoleIds.map((id) => ({
          teamAppRoleId: id,
          appPermissionId: input.permissionId,
        })),
      );
  });
};
