import { unstable_cache } from "next/cache";
import { TRPCError } from "@trpc/server";

import { db, eq, schema } from "@kdx/db";
import { kodixNotificationFromEmail } from "@kdx/react-email/constants";
import { cacheTags } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../trpc";
import { resend } from "../../utils/email/email";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
}

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) =>
  await getInstalledCached({ activeTeamId: ctx.session.user.activeTeamId });

const getInstalledCached = unstable_cache(
  async ({ activeTeamId }: { activeTeamId: string }) => {
    await resend.emails.send({
      from: kodixNotificationFromEmail,
      to: "gdbianchii@gmail.com",
      subject: "getInstalledHandler called",
      html: "<h1>getInstalledHandler called by ${activeTeamId}</h1>",
    });
    const apps = await db
      .select({
        id: schema.apps.id,
      })
      .from(schema.apps)
      .innerJoin(
        schema.appsToTeams,
        eq(schema.apps.id, schema.appsToTeams.appId),
      )
      .innerJoin(schema.teams, eq(schema.appsToTeams.teamId, schema.teams.id))
      .where(eq(schema.teams.id, activeTeamId));

    if (!apps)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });

    return apps;
  },
  [cacheTags.INSTALLED_APPS],
  {
    tags: [cacheTags.INSTALLED_APPS],
  },
);
