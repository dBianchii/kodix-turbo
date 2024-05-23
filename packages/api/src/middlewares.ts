import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { AppPermissionId, KodixAppId } from "@kdx/shared";
import { getAppName } from "@kdx/locales/server-hooks";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "./procedures";
import { getInstalledHandler } from "./routers/app/getInstalled.handler";
import { getUpstashCache, setUpstashCache } from "./upstash";

/**
 *  Helper/factory that returns a reusable middleware that checks if a certain app is installed for the current team
 */
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    //? By using the `getInstalledHandler`, we can use cached data, improving performance
    const apps = await getInstalledHandler({ ctx });

    if (!apps.some((app) => app.id === appId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `${await getAppName(appId)} is not installed`,
      });

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);

export const appPermissionMiddleware = (permissionId: AppPermissionId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const cached = await getUpstashCache("permissions", {
      userId: ctx.session.user.id,
      teamId: ctx.session.user.activeTeamId,
      permissionId,
    });
    let foundPermission = cached;

    if (cached === null) {
      foundPermission = await ctx.db.query.teamAppRoles.findFirst({
        with: {
          AppPermissionsToTeamAppRoles: {
            where: (appPermissionsToTeamAppRole, { eq }) =>
              eq(appPermissionsToTeamAppRole.appPermissionId, permissionId),
          },
          TeamAppRolesToUsers: {
            where: (usersToPermissions, { eq }) =>
              eq(usersToPermissions.userId, ctx.session.user.id),
          },
        },
        where: (teamAppRole, { eq }) =>
          eq(teamAppRole.teamId, ctx.session.user.activeTeamId),
        columns: {
          id: true,
        },
      });

      await setUpstashCache(
        "permissions",
        {
          userId: ctx.session.user.id,
          teamId: ctx.session.user.activeTeamId,
          permissionId,
        },
        foundPermission,
      );
    }

    if (!foundPermission)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You don't have permission to do this. Contact a team administrator if you believe this is an error.`,
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
  //? By using the `getInstalledHandler`, we can use cached data, improving performance
  const installed = await getInstalledHandler({ ctx });

  if (!installed.some((app) => app.id === input.appId))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `${await getAppName(input.appId)} is not installed`,
    });

  return next({ ctx });
});
