import { eq, sql } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";
import { getUpstashCache, setUpstashCache } from "../../upstash";
import { db } from "@kdx/db/client";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
}

const prepared = db
  .select({
    id: schema.apps.id,
  })
  .from(schema.apps)
  .innerJoin(schema.appsToTeams, eq(schema.apps.id, schema.appsToTeams.appId))
  .innerJoin(schema.teams, eq(schema.appsToTeams.teamId, schema.teams.id))
  .where(eq(schema.teams.id, sql.placeholder("teamId")))
  .prepare();

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) => {
  const cached = await getUpstashCache("installedApps", {
    teamId: ctx.session.user.activeTeamId,
  });
  if (cached) return cached;

  const apps = await prepared.execute({
    teamId: ctx.session.user.activeTeamId,
  });

  await setUpstashCache(
    "installedApps",
    {
      teamId: ctx.session.user.activeTeamId,
    },
    apps,
  );

  return apps;
};
