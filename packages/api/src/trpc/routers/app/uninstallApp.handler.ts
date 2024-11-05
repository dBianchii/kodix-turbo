import type { TUninstallAppInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

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
    await appRepository.uninstallAppForTeam(tx, {
      appId: input.appId,
      teamId: ctx.auth.user.activeTeamId,
    });
    await invalidateUpstashCache("apps", {
      teamId: ctx.auth.user.activeTeamId,
    });
  });
};
