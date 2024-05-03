import { db, eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";
import { getUpstashCache, setUpstashCache } from "~/upstash";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
}

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) => {
  const cached = await getUpstashCache("installedApps", {
    teamId: ctx.session.user.activeTeamId,
  });
  if (cached) return cached;

  const apps = await db
    .select({
      id: schema.apps.id,
    })
    .from(schema.apps)
    .innerJoin(schema.appsToTeams, eq(schema.apps.id, schema.appsToTeams.appId))
    .innerJoin(schema.teams, eq(schema.appsToTeams.teamId, schema.teams.id))
    .where(eq(schema.teams.id, ctx.session.user.activeTeamId));

  await setUpstashCache(
    "installedApps",
    {
      teamId: ctx.session.user.activeTeamId,
    },
    apps,
  );

  return apps;
};
