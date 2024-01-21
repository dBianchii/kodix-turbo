import { kodixCareAppId } from "@kdx/shared";

import {
  createTRPCRouter,
  kodixCareInstalledMiddleware,
  protectedProcedure,
} from "../trpc";

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
