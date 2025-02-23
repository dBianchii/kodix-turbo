import type { TUninstallAppInputSchema } from "@kdx/validators/trpc/app";
import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../procedures";

interface UninstallAppOptions {
  ctx: TProtectedProcedureContext;
  input: TUninstallAppInputSchema;
}

export const uninstallAppHandler = async ({
  ctx,
  input,
}: UninstallAppOptions) => {
  const { appRepository } = ctx.repositories;
  await db.transaction(async (tx) => {
    await appRepository.uninstallAppForTeam(
      {
        appId: input.appId,
      },
      tx,
    );
  });
};
