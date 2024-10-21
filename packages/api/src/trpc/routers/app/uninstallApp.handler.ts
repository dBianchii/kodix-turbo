import type { User } from "@kdx/auth";
import type { DrizzleTransaction } from "@kdx/db/client";
import type { KodixAppId } from "@kdx/shared";
import type { TUninstallAppInputSchema } from "@kdx/validators/trpc/app";
import { and, eq } from "@kdx/db";
import { appsToTeams, appTeamConfigs, teamAppRoles } from "@kdx/db/schema";
import { appIdToSchemas } from "@kdx/db/utils";

import type { TProtectedProcedureContext } from "../../procedures";
import { invalidateUpstashCache } from "../../../sdks/upstash";

interface UninstallAppOptions {
  ctx: TProtectedProcedureContext;
  input: TUninstallAppInputSchema;
}

export const uninstallAppHandler = async ({
  ctx,
  input,
}: UninstallAppOptions) => {
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(appsToTeams)
      .where(
        and(
          eq(appsToTeams.appId, input.appId),
          eq(appsToTeams.teamId, ctx.auth.user.activeTeamId),
        ),
      );
    await tx
      .delete(teamAppRoles)
      .where(
        and(
          eq(teamAppRoles.appId, input.appId),
          eq(teamAppRoles.teamId, ctx.auth.user.activeTeamId),
        ),
      );
    await tx
      .delete(appTeamConfigs)
      .where(
        and(
          eq(appTeamConfigs.appId, input.appId),
          eq(appTeamConfigs.teamId, ctx.auth.user.activeTeamId),
        ),
      );

    await removeAppData({
      tx,
      appId: input.appId,
      user: ctx.auth.user,
    });
    await invalidateUpstashCache("apps", {
      teamId: ctx.auth.user.activeTeamId,
    });
  });
};

async function removeAppData({
  tx,
  appId,
  user,
}: {
  tx: DrizzleTransaction;
  appId: KodixAppId;
  user: User;
}) {
  const allSchemasForApp = appIdToSchemas[appId];

  for (const schema of Object.values(allSchemasForApp)) {
    if (!("teamId" in schema)) continue;
    await tx.delete(schema).where(eq(schema.teamId, user.activeTeamId));
  }
}
