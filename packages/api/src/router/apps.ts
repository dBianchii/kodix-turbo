import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      include: {
        ActiveTeams: true,
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
          installed: !!app.ActiveTeams.find(
            (x) => x.id === ctx.session?.user.activeTeamId,
          ),
        };
      })
      .map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ ActiveTeams, devPartnerId, subscriptionCost, ...rest }) => rest,
      ); // remove some fields

    return appsWithInstalled;
  }),
  getInstalled: protectedProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      where: {
        ActiveTeams: {
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
});
