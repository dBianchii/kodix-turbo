import { kodixCareAppId } from "@kdx/shared";

import {
  createTRPCRouter,
  kodixCareInstalledMiddleware,
  protectedProcedure,
} from "../trpc";
import { getAppConfig } from "./apps";

export const kodixCareRouter = createTRPCRouter({
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(async ({ ctx }) => {
      const result = await ctx.prisma.careShift.findFirst({
        where: {
          teamId: ctx.session.user.activeTeamId,
          checkOut: null,
        },
        select: {
          shiftEndedAt: true,
          checkIn: true,
          checkOut: true,
          id: true,
          Caregiver: {
            select: {
              email: true,
              id: true,
              image: true,
              name: true,
            },
          },
        },
      });

      return result;
    }),
  startShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .mutation(async ({ ctx }) => {
      //primeira vez que for clonar, clonar a partir de ontem no incio do dia até 2 dias depois de hoje no final do dia
      const appConfig = await getAppConfig({
        appId: kodixCareAppId,
        prisma: ctx.prisma,
        session: ctx.session,
      });

      //pegar clonedCareTasksUntil

      await ctx.prisma.careShift.create({
        data: {
          teamId: ctx.session.user.activeTeamId,
          checkIn: new Date(),
          caregiverId: ctx.session.user.id,
        },
      });
    }),
  onboardingCompleted: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.appTeamConfig.findUnique({
      where: {
        appId_teamId: {
          appId: kodixCareAppId,
          teamId: ctx.session.user.activeTeamId,
        },
        config: {
          path: "$.patientName",
          not: {
            equals: null,
          },
        },
      },
    });
    return !!result;
  }),
});
