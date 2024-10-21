import type { TGetPermissionsInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq } from "@kdx/db";
import { teamAppRoles } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetPermissionsOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetPermissionsInputSchema;
}

export const getPermissionsHandler = async ({
  ctx,
  input,
}: GetPermissionsOptions) => {
  const teamAppRolesIdsForActiveTeamId = await ctx.db
    .select({ id: teamAppRoles.id })
    .from(teamAppRoles)
    .where(eq(teamAppRoles.teamId, ctx.auth.user.activeTeamId))
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
