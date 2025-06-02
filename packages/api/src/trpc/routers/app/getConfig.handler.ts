import { TRPCError } from "@trpc/server";

import type { TGetConfigInput } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetConfigInput;
}

export const getConfigHandler = async ({ ctx, input }: GetConfigOptions) => {
  const [teamConfig] = await appRepository.findAppTeamConfigs({
    appId: input.appId,
    teamIds: [ctx.auth.user.activeTeamId],
  });

  if (!teamConfig) {
    return null;
  }

  return teamConfig.config;
};
