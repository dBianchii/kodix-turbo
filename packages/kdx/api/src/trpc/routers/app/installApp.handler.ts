import { todoAppId } from "@kodix/shared/db";
import { TRPCError } from "@trpc/server";

import type { TInstallAppInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface InstallAppOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInstallAppInputSchema;
}

export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  if (input.appId === todoAppId)
    //TODO: stinky
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "DISABLED",
    });

  const installed = await appRepository.findInstalledApp({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
  });

  if (installed)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t("api.App already installed"),
    });

  await appRepository.installAppForTeam({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
  });
};
