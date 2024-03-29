import type { TUninstallAppSchema } from "@kdx/validators/trpc/team";
import { and, eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface UninstallAppOptions {
  ctx: TProtectedProcedureContext;
  input: TUninstallAppSchema;
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
  });

  //TODO: remove all data from the app.
};
