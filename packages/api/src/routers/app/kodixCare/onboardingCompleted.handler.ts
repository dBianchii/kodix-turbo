import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../trpc";

interface OnboardingCompletedOptions {
  ctx: TProtectedProcedureContext;
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
