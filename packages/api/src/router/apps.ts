import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Session } from "@kdx/auth";
import type { Prisma, PrismaClient } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";
import { kodixCareConfigSchema } from "@kdx/validators";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

type AppIdsWithConfig = typeof kodixCareAppId; //? Some apps might not have config implemented

export const appsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      include: {
        Teams: true,
      },
    });

    if (!apps.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });
    }

    const appsWithInstalled = apps
      .map((app) => {
        return {
          ...app,
          installed: !!app.Teams.find(
            (x) => x.id === ctx.session?.user.activeTeamId,
          ),
        };
      })
      .map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ Teams, devPartnerId, subscriptionCost, ...rest }) => rest,
      ); // remove some fields

    return appsWithInstalled;
  }),
  getInstalled: protectedProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      where: {
        Teams: {
          some: {
            id: ctx.session.user.activeTeamId,
          },
        },
      },
    });

    if (!apps)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });

    return apps;
  }),
  saveConfig: protectedProcedure //TODO: dynamically check if app is installed
    .input(
      z.object({
        appId: z.literal(kodixCareAppId),
        config: kodixCareConfigSchema,
      }), //TODO: make dynamic based on app
    )
    .mutation(async ({ ctx, input }) => {
      await saveAppConfig({
        appId: input.appId,
        config: input.config,
        prisma: ctx.prisma,
        activeTeamId: ctx.session.user.activeTeamId,
      });
    }),
  getConfig: protectedProcedure
    .input(
      z.object({
        appId: z.custom<AppIdsWithConfig>(),
      }),
    )
    .query(
      async ({ ctx, input }) =>
        await getAppConfig({
          appId: input.appId,
          prisma: ctx.prisma,
          session: ctx.session,
        }),
    ),
});

export async function saveAppConfig({
  appId,
  config,
  prisma,
  activeTeamId,
}: {
  appId: AppIdsWithConfig;
  config: z.infer<typeof kodixCareConfigSchema>;
  prisma: PrismaClient | Prisma.TransactionClient;
  activeTeamId: string;
}) {
  const updateConfig = {
    config: config,
  };
  return await prisma.appTeamConfig.upsert({
    where: {
      appId_teamId: {
        appId: appId,
        teamId: activeTeamId,
      },
    },
    update: updateConfig,
    create: {
      ...updateConfig,
      teamId: activeTeamId,
      appId: appId,
    },
  });
}

export async function getAppConfig({
  appId,
  prisma,
  session,
}: {
  appId: AppIdsWithConfig;
  prisma: PrismaClient;
  session: Session;
}) {
  const result = await prisma.appTeamConfig.findUnique({
    where: {
      appId_teamId: {
        appId,
        teamId: session.user.activeTeamId,
      },
    },
    select: {
      config: true,
    },
  });
  if (!result)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No appTeamConfig found",
    });

  //TODO: Maybe move this getAppTeamConfigSchema elsewhere
  const appIdToAppTeamConfigSchema = {
    [kodixCareAppId]: kodixCareConfigSchema,
  };

  const schema = appIdToAppTeamConfigSchema[appId];

  return schema.parse(result?.config);
}
