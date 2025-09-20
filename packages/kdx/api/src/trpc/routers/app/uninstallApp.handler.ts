import type { TUninstallAppInputSchema } from "@kdx/validators/trpc/app";
import { db } from "@kdx/db/client";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface UninstallAppOptions {
  ctx: TProtectedProcedureContext;
  input: TUninstallAppInputSchema;
}

export const uninstallAppHandler = async ({
  ctx,
  input,
}: UninstallAppOptions) => {
  await db.transaction(async (tx) => {
    await appRepository.uninstallAppForTeam(tx, {
      appId: input.appId,
      teamId: ctx.auth.user.activeTeamId,
    });
  });
};
