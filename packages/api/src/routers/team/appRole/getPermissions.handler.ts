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
  const permissions = await ctx.db.query.appPermissions.findMany({
    where: (appPermission, { eq, and }) =>
      and(
        eq(appPermission.appId, input.appId),
        eq(appPermission.TeamAppRole.teamId, ctx.session.user.activeTeamId),
      ),
    with: {
      AppPermissionsToTeamAppRoles: {
        where: (appPermissionToTeamAppRole, { eq }) =>
          eq(
            appPermissionToTeamAppRole.teamAppRoleId,
            ctx.session.user.activeTeamId,
          ),
      },
    },
  });
  return permissions;
};
