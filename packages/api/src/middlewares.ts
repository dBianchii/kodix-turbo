import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { AppPermissionId, KodixAppId } from "@kdx/shared";
import { and, eq } from "@kdx/db";
import {
  appPermissionsToTeamAppRoles,
  teamAppRoles,
  teamAppRolesToUsers,
} from "@kdx/db/schema";
import { getAppName } from "@kdx/locales/next-intl/server-hooks";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "./procedures";
import { getInstalledHandler } from "./routers/app/getInstalled.handler";
import { t } from "./trpc";
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

    if (!apps.some((app) => app.id === appId)) {
      const t = await getTranslations({ locale: ctx.locale });
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: t("api.appName is not installed", {
          app: await getAppName(appId),
        }),
      });
    }

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);

export const appPermissionMiddleware = (permissionId: AppPermissionId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    let foundPermission = await getUpstashCache("permissions", {
      userId: ctx.session.user.id,
      teamId: ctx.session.user.activeTeamId,
      permissionId,
    });

    if (foundPermission === null) {
      const permission = await ctx.db
        .select({ permissionId: appPermissionsToTeamAppRoles.appPermissionId })
        .from(teamAppRoles)
        .innerJoin(
          teamAppRolesToUsers,
          eq(teamAppRolesToUsers.teamAppRoleId, teamAppRoles.id),
        )
        .innerJoin(
          appPermissionsToTeamAppRoles,
          eq(appPermissionsToTeamAppRoles.teamAppRoleId, teamAppRoles.id),
        )
        .where(
          and(
            eq(teamAppRolesToUsers.userId, ctx.session.user.id),
            eq(teamAppRoles.teamId, ctx.session.user.activeTeamId),
            eq(appPermissionsToTeamAppRoles.appPermissionId, permissionId),
          ),
        )
        .then((res) => res[0]);

      await setUpstashCache("permissions", {
        variableKeys: {
          userId: ctx.session.user.id,
          teamId: ctx.session.user.activeTeamId,
          permissionId,
        },
        value: permission,
      });

      foundPermission = permission;
    }

    if (!foundPermission) {
      const t = await getTranslations({ locale: ctx.locale });
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: t(
          "api.You dont have permission to do this Contact a team administrator if you believe this is an error",
        ),
      });
    }

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
    const t = await getTranslations({ locale: ctx.locale });
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: t("api.appName is not installed", {
        app: await getAppName(input.appId),
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
