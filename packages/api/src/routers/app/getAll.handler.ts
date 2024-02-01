import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetAllOptions {
  ctx: {
    session: Session | null;
    prisma: PrismaClient;
  };
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
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
};
