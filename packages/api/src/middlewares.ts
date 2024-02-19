import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { AppPermissionIds, KodixAppId } from "@kdx/shared";
import { getAppName, kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "./trpc";

/**
 *  Helper/factory that returns a reusable middleware that checks if a certain app is installed for the current team
 */
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const team = await ctx.prisma.team.findUnique({
      where: { id: ctx.session.user.activeTeamId },
      select: {
        ActiveApps: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!team?.ActiveApps.some((x) => x.id === appId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `${getAppName(appId)} is not installed`,
      });

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);

export const appPermissionMiddleware = (permissionId: AppPermissionIds) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const foundPermission = await ctx.prisma.teamAppRole.findFirst({
      where: {
        AppPermissions: {
          some: {
            id: permissionId,
          },
        },
        Team: {
          id: ctx.session.user.activeTeamId,
        },
        Users: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
      select: { id: true },
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
  const team = await ctx.prisma.team.findUnique({
    where: { id: ctx.session.user.activeTeamId },
    select: {
      ActiveApps: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!team?.ActiveApps.some((x) => x.id === input.appId))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `${getAppName(input.appId)} is not installed`,
    });

  return next({ ctx });
});
