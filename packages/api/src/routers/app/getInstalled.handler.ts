import { TRPCError } from "@trpc/server";

import { eq } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
}

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) => {
  const apps = await ctx.db.query.app.findMany({
    with: {
      AppsToTeams: {
        where: (team) => eq(team.teamId, ctx.session.user.activeTeamId),
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
