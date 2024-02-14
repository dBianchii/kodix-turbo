import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { AppPermissionIds, KodixAppId } from "@kdx/shared";
import { getAppName, kodixCareAppId } from "@kdx/shared";

import type { createTRPCContext } from "./trpc";

/**
 *  Helper/factory that returns a reusable middleware that checks if a certain app is installed for the current team
 */
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: Awaited<ReturnType<typeof createTRPCContext>> & {
      session: Session;
    };
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
    ctx: Awaited<ReturnType<typeof createTRPCContext>> & {
      session: Session;
    };
  }>().create(async ({ ctx, next }) => {
    const foundPermission = !!(await ctx.prisma.teamAppRole.findFirst({
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
            id: permissionId,
          },
        },
      },
      select: { id: true },
    }));

    if (!foundPermission)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You don't have permission to do this. Contact an administrator if you believe it is an error.`,
      });

    return next({ ctx });
  });
