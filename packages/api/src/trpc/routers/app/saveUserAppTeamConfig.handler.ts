import type { TSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";

import type { TProtectedProcedureContext } from "../../procedures";

interface SaveUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveUserAppTeamConfigInputSchema;
}

export const saveUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: SaveUserAppTeamConfigOptions) => {
  const { appRepository } = ctx.repositories;
  await appRepository.upsertUserAppTeamConfigs({
    userId: ctx.auth.user.id,
    appId: input.appId,
    input: input.config,
  });
};
