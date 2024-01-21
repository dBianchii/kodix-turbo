import { kodixCareAppId } from "@kdx/shared";

import {
  createTRPCRouter,
  kodixCareInstalledMiddleware,
  protectedProcedure,
} from "../trpc";

export const kodixCareRouter = createTRPCRouter({
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
