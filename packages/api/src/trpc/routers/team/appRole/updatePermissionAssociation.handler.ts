import { TRPCError } from "@trpc/server";

import type { TUpdatePermissionAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { and, eq, inArray } from "@kdx/db";
import { appPermissions, appPermissionsToTeamAppRoles } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdatePermissionAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdatePermissionAssociationInputSchema;
}

export const updatePermissionAssociationHandler = async ({
  ctx,
  input,
}: UpdatePermissionAssociationOptions) => {
  const permission = await ctx.db.query.appPermissions.findFirst({
    where: (appPermissions, { eq }) =>
      eq(appPermissions.id, input.permissionId),
    columns: { editable: true },
  });
  if (!permission) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Permission not found",
    });
  }

  if (!permission.editable) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Permission is not editable",
    });
  }

  await ctx.db.transaction(async (tx) => {
    await tx.delete(appPermissionsToTeamAppRoles).where(
      inArray(
        appPermissionsToTeamAppRoles.appPermissionId,
        ctx.db
          .select({ id: appPermissions.id })
          .from(appPermissions)
          .where(
            and(
              eq(appPermissions.id, input.permissionId),
              eq(appPermissions.appId, input.appId),
            ),
          ),
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
