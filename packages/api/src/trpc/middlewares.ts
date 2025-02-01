import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import { getAppName } from "@kdx/locales/next-intl/server-hooks";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "./procedures";
import { getInstalledHandler } from "./routers/app/getInstalled.handler";
import { t } from "./trpc";

/**
 *  Helper/factory that returns a reusable middleware that checks if a certain app is installed for the current team
 */
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    //? By using the `getInstalledHandler`, we can use cached data, improving performance
    const apps = await getInstalledHandler({ ctx });

    if (!apps.some((app) => app.id === appId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t("api.appName is not installed", {
          app: getAppName(ctx.t, appId),
        }),
      });
    }

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);

export const appPermissionMiddleware = (_permissionId: string) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    // const [permission] = await db
    //   .select({ permissionId: appPermissionsToTeamAppRoles.appPermissionId })
    //   .from(teamAppRoles)
    //   .innerJoin(
    //     teamAppRolesToUsers,
    //     eq(teamAppRolesToUsers.teamAppRoleId, teamAppRoles.id),
    //   )
    //   .innerJoin(
    //     appPermissionsToTeamAppRoles,
    //     eq(appPermissionsToTeamAppRoles.teamAppRoleId, teamAppRoles.id),
    //   )
    //   .where(
    //     and(
    //       eq(teamAppRolesToUsers.userId, ctx.auth.user.id),
    //       eq(teamAppRoles.teamId, ctx.auth.user.activeTeamId),
    //       eq(appPermissionsToTeamAppRoles.appPermissionId, permissionId),
    //     ),
    //   );
    // if (!permission) {
    //   throw new TRPCError({
    //     code: "FORBIDDEN",
    //     message: ctx.t(
    //       "api.You dont have permission to do this Contact a team administrator if you believe this is an error",
    //     ),
    //   });
    // }

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

  if (!installed.some((app) => app.id === input.appId)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ctx.t("api.appName is not installed", {
        app: getAppName(ctx.t, input.appId),
      }),
    });
  }

  return next({ ctx });
});

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
export const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});
