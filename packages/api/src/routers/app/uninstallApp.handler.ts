import type { Session } from "@kdx/auth";
import type { DrizzleTransaction } from "@kdx/db/client";
import type { KodixAppId } from "@kdx/shared";
import type { TUninstallAppInputSchema } from "@kdx/validators/trpc/app";
import { and, eq } from "@kdx/db";
import { appIdToSchemas, schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

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
      .delete(schema.appsToTeams)
      .where(
        and(
          eq(schema.appsToTeams.appId, input.appId),
          eq(schema.appsToTeams.teamId, ctx.session.user.activeTeamId),
        ),
      );
    await tx
      .delete(schema.teamAppRoles)
      .where(
        and(
          eq(schema.teamAppRoles.appId, input.appId),
          eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
        ),
      );
    await tx
      .delete(schema.appTeamConfigs)
      .where(
        and(
          eq(schema.appTeamConfigs.appId, input.appId),
          eq(schema.appTeamConfigs.teamId, ctx.session.user.activeTeamId),
        ),
      );

    await removeAppData({
      tx,
      appId: input.appId,
      session: ctx.session,
    });
  });
};

async function removeAppData({
  tx,
  appId,
  session,
}: {
  tx: DrizzleTransaction;
  appId: KodixAppId;
  session: Session;
}) {
  const allSchemasForApp = appIdToSchemas[appId];

  await tx.transaction(async (tx) => {
    for (const schema of Object.values(allSchemasForApp)) {
      if (!("teamId" in schema)) continue;

      await tx
        .delete(schema)
        .where(eq(schema.teamId, session.user.activeTeamId));
    }
  });
}
