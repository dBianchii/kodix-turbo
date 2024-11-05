import { TRPCError } from "@trpc/server";

import type { TInstallAppInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";
import { invalidateUpstashCache } from "../../../sdks/upstash";

interface InstallAppOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInstallAppInputSchema;
}

export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  const installed = await appRepository.findInstalledApp({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
  });

  if (installed)
    throw new TRPCError({
      message: ctx.t("api.App already installed"),
      code: "BAD_REQUEST",
    });

  await appRepository.installAppForTeam({
    appId: input.appId,
    userId: ctx.auth.user.id,
    teamId: ctx.auth.user.activeTeamId,
  });

  await invalidateUpstashCache("apps", {
    teamId: ctx.auth.user.activeTeamId,
  });
};
