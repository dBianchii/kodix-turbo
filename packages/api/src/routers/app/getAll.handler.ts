import { TRPCError } from "@trpc/server";

import { eq, sql } from "@kdx/db";
import * as schema from "@kdx/db/schema";

import type { TPublicProcedureContext } from "../../procedures";
import { getUpstashCache, setUpstashCache } from "../../upstash";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const cached = await getUpstashCache("apps", {
    teamId: ctx.session?.user?.activeTeamId,
  });
  if (cached) return cached;

  const apps = await ctx.db
    .select({
      id: schema.apps.id,
      ...(ctx.session?.user?.activeTeamId && {
        installed: sql`EXISTS(SELECT 1 FROM ${schema.appsToTeams} WHERE ${eq(
          schema.apps.id,
          schema.appsToTeams.appId,
        )} AND ${eq(schema.appsToTeams.teamId, ctx.session.user.activeTeamId)})`, //? If user is logged in, we select 1 or 0
      }),
    })
    .from(schema.apps)
    .then((res) => {
      if (ctx.session?.user?.activeTeamId)
        return res.map((x) => ({
          ...x,
          installed: !!x.installed, //? And then we convert it to boolean. Javascript is amazing /s
        }));
      return res.map((x) => ({
        ...x,
        installed: false, //? If user is not logged in, we set it to false
      }));
    });

  if (!apps.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No apps found",
    });
  }

  await setUpstashCache("apps", {
    variableKeys: {
      teamId: ctx.session?.user?.activeTeamId,
    },
    value: apps,
  });

  return apps;
};
