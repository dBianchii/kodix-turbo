import type { TGetUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetUserAppTeamConfigInputSchema;
}

export const getUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: GetUserAppTeamConfigOptions) => {
  const { appRepository } = ctx.repositories;

  const [userAppTeamConfig] = await appRepository.findUserAppTeamConfigs({
    userIds: [ctx.auth.user.id],
    appId: input.appId,
    teamIds: [ctx.auth.user.activeTeamId],
  });

  return userAppTeamConfig?.config;
};
