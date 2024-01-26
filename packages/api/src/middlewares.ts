import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { AllAppRoles, KodixAppId } from "@kdx/shared";
import { getAppName, getRoleName, kodixCareAppId } from "@kdx/shared";

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

export const roleMiddlewareOR = (roleIds: AllAppRoles[]) =>
  experimental_standaloneMiddleware<{
    ctx: Awaited<ReturnType<typeof createTRPCContext>> & {
      session: Session;
    };
  }>().create(async ({ ctx, next }) => {
    const userAppRole = await ctx.prisma.userAppRole.findFirst({
      where: {
        userId: ctx.session.user.id,
        appId: kodixCareAppId,
        appRoleId: {
          in: roleIds,
        },
      },
      select: { id: true },
    });

    const messageModifier = roleIds
      .map((roleId) => getRoleName(roleId))
      .join(" or a ");

    if (!userAppRole)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You must be a ${messageModifier} to do this`,
      });

    return next({ ctx });
  });
