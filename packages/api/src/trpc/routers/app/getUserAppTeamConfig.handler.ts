import type { TGetUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";
import { getTeamDbFromCtx } from "../../getTeamDbFromCtx";

interface GetUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetUserAppTeamConfigInputSchema;
}

export const getUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: GetUserAppTeamConfigOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);
  const [userAppTeamConfig] = await appRepository.findUserAppTeamConfigs(
    {
      userIds: [ctx.auth.user.id],
      appId: input.appId,
    },
    teamDb,
  );

  return userAppTeamConfig?.config;
};
