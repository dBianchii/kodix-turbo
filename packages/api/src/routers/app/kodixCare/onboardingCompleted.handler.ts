import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";

interface OnboardingCompletedOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const onboardingCompletedHandler = async ({
  ctx,
}: OnboardingCompletedOptions) => {
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
    select: { id: true },
  });
  return !!result;
};
