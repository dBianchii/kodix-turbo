import { and, eq, schema } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";

interface OnboardingCompletedOptions {
  ctx: TProtectedProcedureContext;
}

export const onboardingCompletedHandler = async ({
  ctx,
}: OnboardingCompletedOptions) => {
  const installed = await ctx.db
    .select({
      id: schema.apps.id,
    })
    .from(schema.apps)
    .innerJoin(schema.appsToTeams, eq(schema.apps.id, schema.appsToTeams.appId))
    .innerJoin(schema.teams, eq(schema.appsToTeams.teamId, schema.teams.id))
    .where(
      and(
        eq(schema.teams.id, ctx.session.user.activeTeamId),
        eq(schema.apps.id, kodixCareAppId),
      ),
    )
    .then((res) => res[0]);
  return !!installed;
};
