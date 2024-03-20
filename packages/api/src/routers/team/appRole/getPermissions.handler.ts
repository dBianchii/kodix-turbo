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
  // return await ctx.prisma.appPermission.findMany({
  //   where: {
  //     appId: input.appId,
  //     TeamAppRole: {
  //       some: {
  //         teamId: ctx.session.user.activeTeamId,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     TeamAppRole: {
  //       select: {
  //         id: true,
  //       },
  //       where: {
  //         teamId: ctx.session.user.activeTeamId,
  //       },
  //     },
  //   },
  // });
  // const permissionsToTeamAppRole = await ctx.db
  //   .select({
  //     appPermissions: schema.appPermissions,
  //     teamAppRole: schema.teamAppRoles,
  //   })
  //   .from(schema.appPermissions)
  //   .innerJoin(
  //     schema.appPermissionsToTeamAppRoles,
  //     eq(
  //       schema.appPermissions.id,
  //       schema.appPermissionsToTeamAppRoles.appPermissionId,
  //     ),
  //   )
  //   .innerJoin(
  //     schema.teamAppRoles,
  //     eq(
  //       schema.teamAppRoles.id,
  //       schema.appPermissionsToTeamAppRoles.teamAppRoleId,
  //     ),
  //   )
  //   .where(
  //     and(
  //       eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
  //       eq(schema.appPermissions.appId, input.appId),
  //     ),
  //   );
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
