import { TRPCError } from "@trpc/server";

import { db, eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
}

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) => {
  const apps = await db
    .select({
      id: schema.apps.id,
    })
    .from(schema.apps)
    .innerJoin(schema.appsToTeams, eq(schema.apps.id, schema.appsToTeams.appId))
    .innerJoin(schema.teams, eq(schema.appsToTeams.teamId, schema.teams.id))
    .where(eq(schema.teams.id, ctx.session.user.activeTeamId));

  if (!apps)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No apps found",
    });

  return apps;
};
