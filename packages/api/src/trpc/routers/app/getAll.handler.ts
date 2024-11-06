import { TRPCError } from "@trpc/server";

import { eq, sql } from "@kdx/db";
import { apps, appsToTeams } from "@kdx/db/schema";
import { todoAppId } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../procedures";
import { getUpstashCache, setUpstashCache } from "../../../sdks/upstash";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const cached = await getUpstashCache("apps", {
    teamId: ctx.auth.user?.activeTeamId,
  });
  if (cached) return cached;

  let _apps = await ctx.db
    .select({
      id: apps.id,
      ...(ctx.auth.user?.activeTeamId && {
        installed: sql`EXISTS(SELECT 1 FROM ${appsToTeams} WHERE ${eq(
          apps.id,
          appsToTeams.appId,
        )} AND ${eq(appsToTeams.teamId, ctx.auth.user.activeTeamId)})`, //? If user is logged in, we select 1 or 0
      }),
    })
    .from(apps)
    .then((res) => {
      if (ctx.auth.user?.activeTeamId)
        return res.map((x) => ({
          ...x,
          installed: !!x.installed, //? And then we convert it to boolean. Javascript is amazing /s
        }));
      return res.map((x) => ({
        ...x,
        installed: false, //? If user is not logged in, we set it to false
      }));
    });
  _apps = _apps.filter((app) => app.id !== todoAppId);

  if (!_apps.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No apps found"),
    });
  }

  await setUpstashCache("apps", {
    variableKeys: {
      teamId: ctx.auth.user?.activeTeamId,
    },
    value: _apps,
  });

  return _apps;
};
