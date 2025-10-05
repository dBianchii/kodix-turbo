import type { TGetUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetUserAppTeamConfigInputSchema;
}

export const getUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: GetUserAppTeamConfigOptions) => {
  const [userAppTeamConfig] = await appRepository.findUserAppTeamConfigs({
    appId: input.appId,
    teamIds: [ctx.auth.user.activeTeamId],
    userIds: [ctx.auth.user.id],
  });

  return userAppTeamConfig?.config;
};
