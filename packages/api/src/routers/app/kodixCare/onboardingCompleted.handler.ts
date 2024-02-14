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
  const appInstalled = await ctx.prisma.app.findUnique({
    where: {
      id: kodixCareAppId,
      Teams: {
        some: {
          id: ctx.session.user.activeTeamId,
        },
      },
    },
  });
  return !!appInstalled;
};
