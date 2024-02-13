import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { AllAppPermissions, KodixAppId } from "@kdx/shared";
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

export const appPermissionMiddlewareOR = (roleIds: AllAppPermissions[]) =>
  experimental_standaloneMiddleware<{
    ctx: Awaited<ReturnType<typeof createTRPCContext>> & {
      session: Session;
    };
  }>().create(async ({ ctx, next }) => {
    const foundPermissions = await ctx.prisma.teamAppRole.findMany({
      where: {
        Users: {
          some: { id: ctx.session.user.id },
        },
        Team: { id: ctx.session.user.activeTeamId },
        AppPermissions: {
          some: {
            id: { in: roleIds },
          },
        },
      },
      select: { id: true },
    });

    if (foundPermissions.length === 0)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You don't have permission to do this. Contact an administrator if you believe it is an error.`,
      });

    return next({ ctx });
  });
