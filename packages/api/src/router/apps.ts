import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Prisma } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";
import { kodixCareConfigSchema } from "@kdx/validators";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
  saveConfig: protectedProcedure
    .input(
      z.object({
        appId: z.literal(kodixCareAppId),
        config: kodixCareConfigSchema,
      }), //TODO: make dynamic based on app
    )
    .mutation(async ({ ctx, input }) => {
      const updateConfig = {
        config: input.config as Prisma.JsonObject,
      };
      return await ctx.prisma.appTeamConfig.upsert({
        where: {
          appId_teamId: {
            appId: input.appId,
            teamId: ctx.session.user.activeTeamId,
          },
        },
        update: updateConfig,
        create: {
          ...updateConfig,
          teamId: ctx.session.user.activeTeamId,
          appId: input.appId,
        },
      });
    }),
});
