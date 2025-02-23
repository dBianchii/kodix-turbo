import { TRPCError } from "@trpc/server";

import type { TInstallAppInputSchema } from "@kdx/validators/trpc/app";
import { todoAppId } from "@kdx/shared";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface InstallAppOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInstallAppInputSchema;
}

export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  const { appRepository } = ctx.repositories;

  if (input.appId === todoAppId)
    //TODO: stinky
    throw new TRPCError({
      message: "DISABLED",
      code: "BAD_REQUEST",
    });

  const installed = await appRepository.findInstalledApp({
    appId: input.appId,
  });

  if (installed)
    throw new TRPCError({
      message: ctx.t("api.App already installed"),
      code: "BAD_REQUEST",
    });

  await appRepository.installAppForTeam({
    appId: input.appId,
    userId: ctx.auth.user.id,
  });
};
