import { TRPCError } from "@trpc/server";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
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
