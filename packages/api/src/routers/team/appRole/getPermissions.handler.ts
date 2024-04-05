import type { TGetPermissionsInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq, schema } from "@kdx/db";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface GetPermissionsOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetPermissionsInputSchema;
}

export const getPermissionsHandler = async ({
  ctx,
  input,
}: GetPermissionsOptions) => {
  const teamAppRolesIdsForActiveTeamId = await ctx.db
    .select({ id: schema.teamAppRoles.id })
    .from(schema.teamAppRoles)
    .where(eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId))
    .then((res) => res.map((r) => r.id));

  const permissions = await ctx.db.query.appPermissions.findMany({
    where: (appPermission, { eq, and }) =>
      and(eq(appPermission.appId, input.appId)),
    with: {
      AppPermissionsToTeamAppRoles: {
        where: (appPermissionToTeamAppRole, { and, inArray }) =>
          and(
            inArray(
              appPermissionToTeamAppRole.teamAppRoleId,
              teamAppRolesIdsForActiveTeamId,
            ),
          ),
        with: {
          TeamAppRole: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });

  return permissions;
};
