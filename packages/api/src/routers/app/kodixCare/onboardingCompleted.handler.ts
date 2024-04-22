import { and, eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";
import { kodixCareAppId, kodixNotificationFromEmail } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { resend } from "../../../utils/email/email";

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

  void resend.emails.send({
    from: kodixNotificationFromEmail,
    to: "gdbianchii@gmail.com",
    subject: "onboardingCompletedHandler was run",
    html: "<h1>onboardingCompletedHandler was run</h1>",
    text: "Teste",
  });

  return !!installed;
};
