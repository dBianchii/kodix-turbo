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
    userIds: [ctx.auth.user.id],
    teamIds: [ctx.auth.user.activeTeamId],
    appId: input.appId,
  });

  return userAppTeamConfig?.config;
};
