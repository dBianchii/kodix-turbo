import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetInstalledOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) => {
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
};
