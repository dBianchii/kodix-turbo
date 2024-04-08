import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { AppPermissionIds, KodixAppId } from "@kdx/shared";
import { eq, schema } from "@kdx/db";
import { getAppName } from "@kdx/locales/server-hooks";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "~/procedures";

/**
 *  Helper/factory that returns a reusable middleware that checks if a certain app is installed for the current team
 */
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const team = await ctx.db.query.teams.findFirst({
      where: eq(schema.teams.id, ctx.session.user.activeTeamId),
      with: {
        AppsToTeams: {
          where: (appsToTeams, { eq }) => eq(appsToTeams.appId, appId),
        },
      },
      columns: {
        id: true,
      },
    });

    if (!team)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `${await getAppName(appId)} is not installed`,
      });

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);

export const appPermissionMiddleware = (permissionId: AppPermissionIds) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const foundPermission = await ctx.db.query.teamAppRoles.findFirst({
      with: {
        AppPermissionsToTeamAppRoles: {
          where: (appPermissionsToTeamAppRole, { eq }) =>
            eq(appPermissionsToTeamAppRole.appPermissionId, permissionId),
        },
        TeamAppRolesToUsers: {
          where: (usersToPermissions, { eq }) =>
            eq(usersToPermissions.teamAppRoleId, ctx.session.user.id),
        },
      },
      where: (teamAppRole, { eq }) =>
        eq(teamAppRole.teamId, ctx.session.user.activeTeamId),
      columns: {
        id: true,
      },
    });

    if (!foundPermission)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You don't have permission to do this. Contact an administrator if you believe it is an error.`,
      });

    return next({ ctx });
  });

/**
 * Same middleware as what is returned by `appInstalledMiddlewareFactory` but does it dynamically based on appId input.
 * This requires the input to have a `appId` as a property.
 */
export const appInstalledMiddleware = experimental_standaloneMiddleware<{
  ctx: TProtectedProcedureContext;
  input: { appId: KodixAppId };
}>().create(async ({ ctx, input, next }) => {
  const team = await ctx.db.query.teams.findFirst({
    where: eq(schema.teams.id, ctx.session.user.activeTeamId),
    with: {
      AppsToTeams: {
        where: (appsToTeams, { eq }) => eq(appsToTeams.appId, input.appId),
      },
    },
    columns: {
      id: true,
    },
  });

  if (!team)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `${await getAppName(input.appId)} is not installed`,
    });

  return next({ ctx });
});
